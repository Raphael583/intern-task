import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Post()
  async createRole(@Body() dto: any) {
    return this.rolesService.createRole(dto);
  }

  @Get()
  async getRoles() {
    return this.rolesService.getAllRoles();
  }

  @Get(':id')
  async getRole(@Param('id') id: string) {
    return this.rolesService.getRoleById(id);
  }

  @Patch(':id')
  async updateRole(@Param('id') id: string, @Body() dto: any) {
    return this.rolesService.updateRole(id, dto);
  }
}
