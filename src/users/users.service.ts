import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './schemas/user.schema';
import { Role } from 'src/roles/schemas/role.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,

    @InjectModel(Role.name)
    private roleModel: Model<Role>,
  ) {}

  // CREATE USER (single tenant, single role)
  async createUser(data: any) {
    const existing = await this.userModel.findOne({ email: data.email });
    if (existing) throw new BadRequestException('User already exists');

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const role = await this.roleModel.findById(data.role);
    if (!role) throw new BadRequestException('Invalid role');

    const user = new this.userModel({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      user_type: data.user_type,
      tenantId: new Types.ObjectId(data.tenant),
      role: role._id,
      passwordUpdatedAt: new Date(),
    });

    return user.save();
  }

  // LOGIN HELPER (used in AuthService)
  async findByEmailAndTenant(email: string, tenantId: string) {
    return this.userModel.findOne({
      email,
      tenantId: new Types.ObjectId(tenantId),
    });
  }

  async findById(id: string) {
    return this.userModel.findById(id);
  }

  
  async updatePassword(email: string, newPlainPassword: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('User not found');

    const hash = await bcrypt.hash(newPlainPassword, 10);
    user.password = hash;
    user.passwordUpdatedAt = new Date();
    await user.save();

   
    return { message: 'Password updated successfully' };
  }

  
  async getUsersWithPermissions(jwtUser: any) {
    
    const userId = jwtUser.sub || jwtUser.id;
    const tenantId = jwtUser.tenant || jwtUser.tenantId;

    const currentUser = await this.userModel.findById(userId);
    if (!currentUser) throw new NotFoundException('Current user not found');

    const roleId = currentUser.role.toString();

    
    const role = await this.roleModel.findById(roleId).lean();
    if (!role) throw new ForbiddenException('Role not found');

    
    const viewPerm = role.permissions.find((p) => p.key === 'users')?.actions;

    if (!viewPerm?.view && !viewPerm?.readAll) {
      throw new ForbiddenException('You do not have permission to view users');
    }

    
    const query: any = { tenantId: new Types.ObjectId(tenantId) };
    let users: any[] = await this.userModel.find(query).lean();

    // FIELD-LEVEL PERMISSIONS
    const restricted = viewPerm.restricted_view_fields || [];
    const allowed = viewPerm.allowed_view_fields || [];

    users = users.map((u) => {
      const filtered = { ...u };

      // Remove restricted fields
      for (const field of restricted) delete filtered[field];

      // If allowed fields exist → return only those
      if (allowed.length > 0) {
        const allowFiltered: any = {};
        allowed.forEach((f) => (allowFiltered[f] = filtered[f]));
        return allowFiltered;
      }

      return filtered;
    });

    return { count: users.length, users };
  }
}
