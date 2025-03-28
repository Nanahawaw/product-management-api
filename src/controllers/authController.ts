import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUser, UserModel } from '../models/User';
import { AdminModel, IAdmin } from '../models/Admin';

// Register User
export const registerUser = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await UserModel.findOne({ email: req.body.email });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({ name, email, password: hashedPassword });
    await newUser.save();

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Login User
export const loginUser = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  try {
    const user: IUser = await UserModel.findOne({
      email: req.body.email,
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: '1h',
    });

    return res.status(200).json({ token, userId: user._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
export const loginAdmin = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  try {
    const admin: IAdmin = await AdminModel.findOne({ email });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '1h',
      }
    );

    return res.status(200).json({ token, id: admin._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
