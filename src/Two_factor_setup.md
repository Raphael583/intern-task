

#  Two-Factor Authentication (2FA) Setup (NestJS + Google Authenticator)

This project includes **Time-based One-Time Password (TOTP)** Two-Factor Authentication using **Google Authenticator**.
2FA strengthens account security by requiring a 6-digit rotating OTP in addition to email/password login.

##  Features

* Generate **TOTP secret keys**
* Generate **Google Authenticator compliant otpauth:// URLs**
* Generate **QR Codes** for easy scanning
* Store secret key in MongoDB
* Verify OTP during login
* Works with Postman + Mobile Authenticator apps

# 📦 Installation

Install required packages:

```bash
npm install speakeasy 
npm install qrcode
npm install --save-dev @types/speakeasy
```

#  File Modifications

Below is everything you must add/change in your project.

# 1️⃣ Update User Schema

File: `src/users/schemas/user.schema.ts`

```ts
@Prop({ required: false })
twoFactorSecret?: string;

@Prop({ default: false })
isTwoFactorEnabled?: boolean;
```

# 2️⃣ Two-Factor Auth Service

File: `src/auth/two-factor-auth.service.ts`

```ts
import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

@Injectable()
export class TwoFactorAuthService {
  async generateSecret(email: string) {
    const secret = speakeasy.generateSecret({ length: 20 });

    const issuer = 'MyApp';
    const label = `${issuer}:${email}`;

    const otpauth_url =
      `otpauth://totp/${encodeURIComponent(label)}?secret=${secret.base32}` +
      `&issuer=${encodeURIComponent(issuer)}&digits=6&period=30&algorithm=SHA1`;

    const qrCodeDataURL = await QRCode.toDataURL(otpauth_url);

    return {
      base32: secret.base32,
      otpauth_url,
      qrCode: qrCodeDataURL,
    };
  }

  verifyCode(secret: string, token: string) {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1,
    });
  }
}
```

#  Auth Controller — Setup & Login
 
 File: `src/auth/auth.controller.ts`

### **Enable 2FA – Step 1**

```ts
@Post('2fa/setup')
async setupTwoFactor(@Body('email') email: string) {
  const user = await this.userModel.findOne({ email });
  if (!user) {
    throw new UnauthorizedException('User not found');
  }

  const secretData = await this.twoFAService.generateSecret(email);

  user.twoFactorSecret = secretData.base32;
  user.isTwoFactorEnabled = true;
  await user.save();

  return {
    message: 'Scan this QR code or manually enter the secret key',
    secret: secretData.base32,
    otpauth_url: secretData.otpauth_url,
    qr_code: secretData.qrCode,
  };
}
```

### **Verify 2FA Login – Step 2**

```ts
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
```

#  Auth Service — Verify OTP

File: `src/auth/auth.service.ts`

```ts
async verifyTwoFactorLogin(userId: string, code: string, tenantId: string) {
  const user = await this.userModel.findOne({ _id: userId, tenantId });

  if (!user || !user.twoFactorSecret) {
    throw new UnauthorizedException('2FA not enabled for this user');
  }

  const isValid = this.twoFAService.verifyCode(user.twoFactorSecret, code);

  if (!isValid) {
    throw new UnauthorizedException('Invalid or expired 2FA code');
  }

  return this.generateJwtToken(user);
}
```

#  Testing in Postman

### **Step 1 — Setup 2FA**

```
POST /auth/2fa/setup
Body:
{
   "email": "user@gmail.com"
}
```

Response:

* Secret key
* otpauth:// URL
* QR code (base64 image)

 **Scan the QR code** with Google Authenticator

### **Step 2 — Login to get userId**

```
POST /auth/login
```

Copy the **userId** (from JWT or response).

### **Step 3 — Enter OTP**

```
POST /auth/2fa/login
Headers:
x-tenant-id: YOUR_ID

Body:
{
  "userId": "xxxxxx",
  "code": "123456"
}
```

If correct → JWT token returned.
If wrong → “Invalid or expired 2FA code”.

---

#  Notes

* OTP expires every **30 seconds**
* Time on phone ≠ backend → OTP invalid
* Must delete old accounts from Google Authenticator
* Only scan the **latest QR code**

---

# 2FA Setup Complete
