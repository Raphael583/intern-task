import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async createUser(data: any) {
    const existing = await this.userModel.findOne({ email: data.email });
    if (existing) throw new BadRequestException('User already exists');

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = new this.userModel({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      user_type: data.user_type,
      tenant: new Types.ObjectId(data.tenant),
      passwordUpdatedAt: new Date(),
    });

    return user.save();
  }

  async findByEmailAndTenant(email: string, tenantId: string) {
    return this.userModel.findOne({
      email,
      tenant: new Types.ObjectId(tenantId),
    });
  }

  async findById(id: string) {
    return this.userModel.findById(id);
  }
}
