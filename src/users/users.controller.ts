import {
  Body,
  Controller,
  Post,
  Headers,
  BadRequestException,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/common/guards/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // --------------------------
  // CREATE USER  (like her)
  // --------------------------
  @Post('create-user')
  async createUser(
    @Body() body: any,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('x-tenant-id header is required');
    }

    // body must contain: name, email, password, user_type, role (roleId)
    return this.usersService.createUser({
      ...body,
      tenant: tenantId,
    });
  }

  // --------------------------
  // UPDATE PASSWORD
  // --------------------------
  @Post('update-password')
  async updatePassword(
    @Body() data: { email: string; password: string },
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('x-tenant-id header is required');
    }

    return this.usersService.updatePassword(data.email, data.password);
  }

  // --------------------------
  // GET USERS  (permission inside service)
  // --------------------------
  @UseGuards(AuthGuard) // simple guard like her project
  @Get()
  async getUsers(@Req() req: any) {
    const jwtUser = req.user; // set by AuthGuard
    return this.usersService.getUsersWithPermissions(jwtUser);
  }
}
