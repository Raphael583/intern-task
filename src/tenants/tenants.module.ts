import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Hospital,HospitalSchema } from './schemas/hospital.schema';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Hospital.name, schema: HospitalSchema },
    ]),
  ],
  providers: [TenantsService],
  controllers: [TenantsController],
  exports: [TenantsService, MongooseModule],
})
export class TenantsModule {}
