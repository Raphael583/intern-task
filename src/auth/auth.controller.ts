import { Controller, Post, Body, Headers, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // --- LOGIN ---
  @Post('login')
  login(@Body() body: LoginDto, @Headers('x-tenant-id') tenantId: string) {
    return this.authService.login(body, tenantId);
  }

  // --- CHANGE PASSWORD ---
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Req() req, @Body() body: ChangePasswordDto) {
    // Verify email matches logged-in user
    if (req.user.email !== body.email) {
      throw new BadRequestException('Email does not match logged-in user');
    }

    return this.authService.changePassword(
      req.user.sub,          // userId from JWT
      body.currentPassword,
      body.newPassword,
    );
  }

  // --- LOGOUT ---
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req, @Body('sessionId') sessionId: string) {
    const userId = req.user.sub;
    const tenantId = req.headers['x-tenant-id'] as string;
    return this.authService.logout(userId, tenantId, sessionId);
  }
}
