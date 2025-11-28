import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions_required';

/**
 * @moduleKey = permission.key (e.g., "patients", "appointments")
 * @action = "create" | "view" | "update" | "delete" | "readAll"
 */
export const Permissions = (moduleKey: string, action: string) =>
  SetMetadata(PERMISSIONS_KEY, { moduleKey, action });
