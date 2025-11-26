import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSession, UserSessionSchema } from './schemas/usersession.schema';
import { RedisModule } from 'src/common/redis/redis.module';

@Module({
   imports:([
      MongooseModule.forFeature([
            { name: UserSession.name, schema: UserSessionSchema },
          ]),
          RedisModule,
    ]),
  providers: [SessionsService],
  controllers: [SessionsController],
  exports:[SessionsService]
})
export class SessionsModule {}
