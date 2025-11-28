import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from '../roles/schemas/role.schema';
import { RolesService } from '../roles/roles.service';
import { RolesController } from '../roles/roles.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
    ]),
  ],
  providers: [RolesService],
  controllers: [RolesController],
  exports: [RolesService],   
})
export class RolesModule {}
