import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

@Injectable()
export class TwoFactorAuthService {
async generateSecret(email: string) {
  const secret = speakeasy.generateSecret({
    length: 20,
  });

  const issuer = 'Fresh';
  const label = `${issuer}:${email}`;

  const otpauth_url =
    `otpauth://totp/${label}?secret=${secret.base32}` +
    `&issuer=${encodeURIComponent(issuer)}` +
    `&digits=6&period=30&algorithm=SHA1`;

  const qrCodeDataURL = await QRCode.toDataURL(otpauth_url);

  return {
    base32: secret.base32,
    otpauth_url,
    qrCodeDataURL,
  };
}



  verifyCode(secret: string, token: string) {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 0,
    });
  }
}
