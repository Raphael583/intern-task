import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UserSession } from 'src/sessions/schemas/usersession.schema';

@Module({
  imports:([
    MongooseModule.forFeature([
          { name: User.name, schema: UserSchema },
        ]),
  ]),
  providers: [UsersService],
  controllers: [UsersController],
  exports:[UsersService]
})
export class UsersModule {}
