import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { TenantsModule } from '../tenants/tenants.module';
import { SessionsModule } from 'src/sessions/sessions.module';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { RedisModule } from 'src/common/redis/redis.module';
import { MailModule } from 'src/common/mail/mail.module';

const jwtExpiresIn: string | number = process.env.JWT_EXPIRES_IN || '1d';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UsersModule,
    MailModule,
    TenantsModule,
    SessionsModule,
    RedisModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: jwtExpiresIn as any }, //  cast to any fixes TS error
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
