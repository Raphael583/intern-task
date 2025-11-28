import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum UserType {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT',
}

export class CreatedBy {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  name: string;
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: String, enum: UserType, required: true })
  user_type: UserType;

  
  @Prop({ type: Types.ObjectId, ref: 'Hospital', required: true })
  tenantId: Types.ObjectId;

  
  @Prop({ type: Types.ObjectId, ref: 'Role', required: true })
  role: Types.ObjectId;

  @Prop()
  passwordUpdatedAt: Date;

  @Prop({ type: CreatedBy })
  created_by: CreatedBy;
}

export const UserSchema = SchemaFactory.createForClass(User);
