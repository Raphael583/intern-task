import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SessionsService } from 'src/sessions/sessions.service';
import { Request } from 'express';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private sessionsService: SessionsService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();

    const authHeader = req.headers['authorization'];
    if (!authHeader) throw new UnauthorizedException('No token provided');

    const parts = authHeader.split(' ');
    if (parts.length !== 2)
      throw new UnauthorizedException('Invalid token format');

    const [, token] = parts;

    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const tenantId = req.headers['x-tenant-id'] as string;
    if (!tenantId) throw new BadRequestException('Tenant header missing');
    if (payload.tenant !== tenantId)
      throw new UnauthorizedException('Tenant mismatch');

    const session = await this.sessionsService.findByAccessToken(token);
    if (!session) throw new UnauthorizedException('Session not found');
    if (session.status !== 'ACTIVE')
      throw new UnauthorizedException('Session inactive');

    const dbUser = await this.usersService.findById(payload.sub);
    if (dbUser?.passwordUpdatedAt) {
      const tokenIatMs = (payload.iat || 0) * 1000;
      if (tokenIatMs < new Date(dbUser.passwordUpdatedAt).getTime()) {
        throw new UnauthorizedException(
          'Session invalidated due to password change',
        );
      }
    }

    req['user'] = payload;
    return true;
  }
}
