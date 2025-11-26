import { Module } from '@nestjs/common';
import { MailModule } from './mail/mail.module';
import { RedisService } from './redis/redis.service';

@Module({
  imports: [MailModule],
  exports: [MailModule, RedisService],
  providers:[RedisService],
})
export class CommonModule {}
