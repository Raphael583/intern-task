import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum UserType {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT',
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
  tenant: Types.ObjectId;   // hospitalId (tenant ID)

  @Prop()
  passwordUpdatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
