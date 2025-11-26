import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hospital } from './schemas/hospital.schema';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class TenantsService {
    constructor(
    @InjectModel(Hospital.name)
    private hospitalModel: Model<Hospital>,
  ) {}

  async createTenant(data: any) {
    const exists = await this.hospitalModel.findOne({ code: data.code });
    if (exists) throw new BadRequestException('Hospital code already exists');

    const hospital = new this.hospitalModel({
      name: data.name,
      code: data.code,
      email: data.email,
      phone: data.phone,
      address: data.address,
    });

    return hospital.save();
  }
  // ✔ ADD THIS METHOD HERE (inside class)
  async findById(id: string) {
    return this.hospitalModel.findById(id);
  }
}
