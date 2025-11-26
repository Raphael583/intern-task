import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const tenantId = req.headers['x-tenant-id'];

    if (!tenantId) {
      throw new BadRequestException('Tenant ID (x-tenant-id) is required.');
    }

    req.tenantId = tenantId; // attach to request object
    next();
  }
}
