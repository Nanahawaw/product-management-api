import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => {
    console.log('Connected to the database');
    // Only start server if NOT running tests
    if (process.env.NODE_ENV !== 'test') {
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    }
  })
  .catch((error) => console.error('Error connecting to the database', error));

export default app;
