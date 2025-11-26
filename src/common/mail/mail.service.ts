import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailer: MailerService) {}

  async sendMultiLoginAlert(user: any) {
    await this.mailer.sendMail({
      to: user.email,
      subject: 'New Login Detected',
      template: 'multi-login', // refers to multi-login.hbs
      context: {
        name: user.name,
        email: user.email,
        time: new Date().toLocaleString(),
        device: 'Unknown device', // later we can pass actual device info
      },
    });
  }
}
