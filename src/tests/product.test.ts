import request from 'supertest';
import app from '../app';
import Admin from '../models/Admin';
import Product from '../models/Product';
import bcrypt from 'bcryptjs';

let adminToken: string;

beforeAll(async () => {
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await Admin.create({
    name: 'Super Admin',
    email: 'admin@store.com',
    password: hashedPassword,
  });

  const res = await request(app).post('/api/admin/login').send({
    email: 'admin@store.com',
    password: 'Admin123!',
  });

  adminToken = res.body.token;
});

describe('Product Management', () => {
  it('should allow admin to create a product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Product 1',
        price: 100,
        description: 'This is a test product',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('name', 'Product 1');
  });

  it('should not allow non-admins to create a product', async () => {
    const res = await request(app).post('/api/products').send({
      name: 'Product 2',
      price: 50,
      description: 'This is another test product',
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Unauthorized');
  });

  it('should fetch all products', async () => {
    await Product.create({
      name: 'Product 3',
      price: 150,
      description: 'Another test product',
    });

    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should allow admin to delete a product', async () => {
    const product = await Product.create({
      name: 'Product to delete',
      price: 200,
      description: 'To be deleted',
    });

    const res = await request(app)
      .delete(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Product deleted');
  });
});
