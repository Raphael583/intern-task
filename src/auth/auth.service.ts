import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { TenantsService } from '../tenants/tenants.service';
import { SessionsService } from 'src/sessions/sessions.service';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';
import { MailService } from 'src/common/mail/mail.service';
import { RedisService } from 'src/common/redis/redis.service';
import { TwoFactorAuthService } from './two-factor-auth.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private usersService: UsersService,
    private tenantsService: TenantsService,
    private jwtService: JwtService,
    private sessionsService: SessionsService,
    private mailService: MailService,
    private redisService: RedisService,
    private twoFAService: TwoFactorAuthService,
  ) {}

  // =========================================
  // LOGIN PHASE 1 (EMAIL + PASSWORD)
  // =========================================
  async login(body: { email: string; password: string }, tenantId: string) {
    const tenant = await this.tenantsService.findById(tenantId);
    if (!tenant) throw new BadRequestException('Invalid tenant');

    const user = await this.usersService.findByEmailAndTenant(
      body.email,
      tenantId,
    );
    if (!user)
      throw new UnauthorizedException('Invalid email or password');

    const isPassCorrect = await bcrypt.compare(body.password, user.password);
    if (!isPassCorrect)
      throw new UnauthorizedException('Invalid email or password');

    // ⭐ 2FA CHECK ⭐
    if (user.isTwoFactorEnabled) {
      return {
        message: 'Enter your 6-digit Google Authenticator code',
        twoFactorRequired: true,
        userId: user._id.toString(),
      };
    }

    // =========================
    // NORMAL LOGIN (NO 2FA)
    // =========================
    return this.finalizeLogin(user, tenantId);
  }

  // =========================================
  // LOGIN PHASE 2 (VERIFY OTP)
  // =========================================
  async verifyTwoFactorLogin(userId: string, code: string, tenantId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

   if (!user.twoFactorSecret) {
  throw new UnauthorizedException('2FA is not enabled for this user');
}

const isValid = this.twoFAService.verifyCode(
  user.twoFactorSecret,
  code,
);


    if (!isValid)
      throw new UnauthorizedException('Invalid or expired 2FA code');

    return this.finalizeLogin(user, tenantId);
  }

  // =========================================
  // FINAL LOGIN HANDLER (USED BY BOTH FLOWS)
  // =========================================
  private async finalizeLogin(user: any, tenantId: string) {
    const activeSessions = await this.sessionsService.getActiveSessions(
      user._id.toString(),
      tenantId,
    );

    if (activeSessions.length > 0) {
      await this.mailService.sendMultiLoginAlert({
        name: user.name,
        email: user.email,
      });
    }

    const redisKey = `login:${tenantId}:${user._id}`;
    await this.redisService.sadd(redisKey, `session-${Date.now()}`);

    const payload = {
      sub: user._id.toString(),
      email: user.email,
      user_type: user.user_type,
      tenant: tenantId,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET as string,
      expiresIn: process.env.JWT_EXPIRES_IN as any,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret:
        (process.env.JWT_REFRESH_SECRET as string) ||
        (process.env.JWT_SECRET as string),
      expiresIn:
        (process.env.JWT_REFRESH_EXPIRES_IN as any) || '7d',
    });

    await this.sessionsService.createSession(
      user._id.toString(),
      tenantId,
      accessToken,
      refreshToken,
    );

    return {
      message: 'Login successful',
      access_token: accessToken,
      refresh_token: refreshToken,
      user,
    };
  }

  // ================================
  // CHANGE PASSWORD
  // ================================
  async changePassword(userId: string, current: string, next: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const ok = await bcrypt.compare(current, user.password);
    if (!ok) throw new BadRequestException('Current password is incorrect');

    user.password = await bcrypt.hash(next, 10);
    user.passwordUpdatedAt = new Date();
    await user.save();

    await this.sessionsService.invalidateAllSessionsForUser(userId);

    return { message: 'Password changed successfully' };
  }

  // ================================
  // LOGOUT
  // ================================
  async logout(userId: string, tenantId: string, sessionId: string) {
    return this.sessionsService.deactivateSession(sessionId, tenantId, userId);
  }
}
