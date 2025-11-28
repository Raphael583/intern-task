import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.get(
      PERMISSIONS_KEY,
      context.getHandler(),
    );

    if (!required) return true; // no permissions required

    const { moduleKey, action } = required;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.permissions)
      throw new ForbiddenException('Permissions not found in token');

    // find permission for module
    const modulePermission = user.permissions.find(
      (p) => p.key === moduleKey,
    );

    if (!modulePermission)
      throw new ForbiddenException(
        `No permissions defined for module: ${moduleKey}`,
      );

    // check action allowed
    if (!modulePermission.actions[action])
      throw new ForbiddenException(
        `You don't have permission to ${action} ${moduleKey}`,
      );

    return true;
  }
}
