import {
  Controller,
  UnauthorizedException,
  Post,
  Body,
  Headers,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { TwoFactorAuthService } from './two-factor-auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,

    @InjectModel(User.name)
    private userModel: Model<User>,

    private twoFAService: TwoFactorAuthService,
  ) {}

  // =============================
  // LOGIN (PHASE 1)
  // =============================
  @Post('login')
  login(@Body() body: LoginDto, @Headers('x-tenant-id') tenantId: string) {
    return this.authService.login(body, tenantId);
  }

  
  // ENABLE 2FA (ONE-TIME SETUP)
  
 
// ENABLE 2FA (SETUP)

@Post('2fa/setup')
async setupTwoFactor(@Body('email') email: string) {
  const user = await this.userModel.findOne({ email });
  if (!user) throw new UnauthorizedException('User not found');

  const { base32, otpauth_url, qrCodeDataURL } =
    await this.twoFAService.generateSecret(email);

  user.twoFactorSecret = base32;
  user.isTwoFactorEnabled = true;
  await user.save();

  return {
    message: 'Scan this QR code or manually enter secret',
    secret: base32,
    otpauth_url,
    qr_code: qrCodeDataURL,
  };
}

// =============================
// VERIFY 2FA LOGIN
// =============================
@Post('2fa/login')
async twoFactorLogin(
  @Body() body: { userId: string; code: string },
  @Headers('x-tenant-id') tenantId: string,
) {
  return this.authService.verifyTwoFactorLogin(
    body.userId,
    body.code,
    tenantId,
  );
}


  // =============================
  // CHANGE PASSWORD
  // =============================
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Req() req, @Body() body: ChangePasswordDto) {
    if (req.user.email !== body.email) {
      throw new BadRequestException('Email does not match logged-in user');
    }

    return this.authService.changePassword(
      req.user.sub,
      body.currentPassword,
      body.newPassword,
    );
  }

  
  // LOGOUT
  
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req, @Body('sessionId') sessionId: string) {
    const userId = req.user.sub;
    const tenantId = req.headers['x-tenant-id'] as string;
    return this.authService.logout(userId, tenantId, sessionId);
  }
}
