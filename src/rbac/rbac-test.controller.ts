import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { Permissions } from 'src/common/decorators/permission.decorator';

@Controller('rbac-test')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class RbacTestController {
  
  @Post('create-patient')
  @Permissions('patients', 'create')   // module = patients, action = create
  createPatient(@Body() body) {
    return {
      message: '✔ Patient created (RBAC Test)',
      body,
    };
  }

  @Get('view-patients')
  @Permissions('patients', 'view')
  viewPatients() {
    return {
      message: '✔ Viewing patients allowed (RBAC Test)',
    };
  }

  @Post('update-patient')
  @Permissions('patients', 'update')
  updatePatient(@Body() body) {
    return {
      message: '✔ Patient updated (RBAC Test)',
    };
  }

  @Post('delete-patient')
  @Permissions('patients', 'delete')
  deletePatient(@Body() body) {
    return {
      message: '✔ Patient deleted (RBAC Test)',
    };
  }

  @Get('read-all')
  @Permissions('patients', 'readAll')
  readAllPatients() {
    return {
      message: '✔ Access to read all patients granted (RBAC Test)',
    };
  }
}
