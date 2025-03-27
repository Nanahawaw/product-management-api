import mongoose from 'mongoose';
import Admin from '../models/Admin';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    //check if the admin already exists

    const existingAdmin = await Admin.findOne({ email: 'admin@nans.co' });
    if (existingAdmin) {
      console.log('Admin already exists');
      return;
    }
    //hash the password
    const hashedPassword = await bcrypt.hash('Password00123@', 10);

    //create the admin
    const admin = new Admin({
      first_name: 'Yetunde',
      last_name: 'Folarin',
      email: 'admin@nans.co',
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
