import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Hospital extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  code: string; // tenant code like: HAYAT, MED, ABC

  @Prop()
  email: string;

  @Prop()
  phone: string;

  @Prop()
  address: string;
}

export const HospitalSchema = SchemaFactory.createForClass(Hospital);
