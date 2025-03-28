import mongoose from 'mongoose';
import { AdminModel } from '../models/Admin';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    //check if the admin already exists

    const existingAdmin = await AdminModel.findOne({ email: 'admin@nans.co' });
    if (existingAdmin) {
      console.log('Admin already exists');
      return;
    }
    //hash the password
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    //create the admin
    const admin = new AdminModel({
      first_name: process.env.ADMIN_FIRST_NAME,
      last_name: process.env.ADMIN_LAST_NAME,
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
    });
    await admin.save();
    console.log('Admin created successfully');
  } catch (error) {
    console.error('Error seeding Admin', error);
  } finally {
    mongoose.connection.close();
  }
};
seedAdmin();
