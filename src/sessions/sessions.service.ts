import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserSession } from './schemas/usersession.schema';
import { Status } from 'src/common/enums/status.enum';
import { RedisService } from 'src/common/redis/redis.service';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(UserSession.name)
    private sessionModel: Model<UserSession>,

    private readonly redisService: RedisService,
  ) {}

  // ---------------------------------------------------
  // CREATE SESSION
  // ---------------------------------------------------
  async createSession(
    userId: string,
    tenantId: string,
    accessToken: string,
    refreshToken: string,
  ) {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 1);

    const session = await this.sessionModel.create({
      user_id: new Types.ObjectId(userId),
      tenant: new Types.ObjectId(tenantId),
      access_token: accessToken,
      refresh_token: refreshToken,
      expiry_at: expiry,
      status: Status.ACTIVE,
    });

    await this.redisService.sadd(
      `login:${tenantId}:${userId}`,
      session._id.toString(),
    );

    await this.redisService.set(
      `login_expire:${tenantId}:${userId}`,
      expiry.getTime().toString(),
    );

    return session;
  }

  // ---------------------------------------------------
  // NEW — Get Active Sessions (for multi-login detection)
  // ---------------------------------------------------
  async getActiveSessions(userId: string, tenantId: string) {
    return this.sessionModel.find({
      user_id: new Types.ObjectId(userId),
      tenant: new Types.ObjectId(tenantId),
      status: Status.ACTIVE,
    });
  }

  // ---------------------------------------------------
  // INVALIDATE ALL SESSIONS (after password reset)
  // ---------------------------------------------------
  async invalidateAllSessionsForUser(userId: string) {
    await this.sessionModel.updateMany(
      { user_id: new Types.ObjectId(userId), status: Status.ACTIVE },
      { $set: { status: Status.INACTIVE } },
    );

    await this.redisService.publish(
      `user:${userId}:sessions`,
      JSON.stringify({ event: 'password_changed' }),
    );
  }

  // ---------------------------------------------------
  // LOGOUT — Remove one session
  // ---------------------------------------------------
  async deactivateSession(sessionId: string, tenantId: string, userId: string) {
    await this.sessionModel.updateOne(
      { _id: new Types.ObjectId(sessionId) },
      { $set: { status: Status.INACTIVE } },
    );

    await this.redisService.srem(`login:${tenantId}:${userId}`, sessionId);

    return { message: 'Logged out successfully' };
  }

  // ---------------------------------------------------
  // FIND SESSIONS
  // ---------------------------------------------------
  async findByAccessToken(token: string) {
    return this.sessionModel.findOne({ access_token: token });
  }

  async findByRefreshToken(refreshToken: string) {
    return this.sessionModel.findOne({ refresh_token: refreshToken });
  }
}
