import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Role } from '../roles/schemas/role.schema';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name)
    private roleModel: Model<Role>,
  ) {}

 
  async createRole(dto: any) {
    return this.roleModel.create(dto);
  }

  //  role: update permissions, name, status, etc
  async updateRole(id: string, dto: any) {
    return this.roleModel.findByIdAndUpdate(id, dto, { new: true });
  }

  // Get role by ID (for permission guard)
  async getRoleById(id: string) {
    return this.roleModel.findById(id);
  }

  // Get role by key (ADMIN, DOCTOR, PATIENT)
  async getRoleByKey(key: string) {
    return this.roleModel.findOne({ key });
  }

  // List all roles (optional)
  async getAllRoles() {
    return this.roleModel.find();
  }
}