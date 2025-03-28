import { Schema, model } from 'mongoose';

export interface IAdmin {
  _id?: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

const AdminSchema = new Schema<IAdmin>(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const AdminModel = model<IAdmin>('admin', AdminSchema);
