import { Controller,Post,Body } from '@nestjs/common';
import { TenantsService } from './tenants.service';

@Controller('tenants')
export class TenantsController {
    constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  createHospital(@Body() body: any) {
    return this.tenantsService.createTenant(body);
  }
}
