import { Schema, model } from 'mongoose';

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password: string;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v: string) {
          // Regular expression for validating an Email
          return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email address!`,
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      validate: {
        validator: function (v: string) {
          // At least 8 characters, containing uppercase, lowercase, number, and special character
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
            v
          );
        },
        message: () =>
          'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      },
    },
  },
  { timestamps: true }
);

export const UserModel = model<IUser>('user', UserSchema);
