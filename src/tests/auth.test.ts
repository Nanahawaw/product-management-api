import request from 'supertest';
import app from '../app';
import Admin from '../models/Admin';
import bcrypt from 'bcryptjs';

describe('User Registration', () => {
  it('should register a new user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'Password00123@',
    });
    expect(res.status).toBe(201);
  });

  it('should prevent registering with an existing email', async () => {
    // First registration
    await request(app).post('/api/auth/register').send({
      username: 'uniqueuser',
      email: 'existing@example.com',
      password: 'Password00123@',
    });

    // Attempt duplicate registration
    const res = await request(app).post('/api/auth/register').send({
      username: 'anotheruser',
      email: 'existing@example.com',
      password: 'Password00123@',
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'User already exists');
  });

  it('should reject invalid email format', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'invaliduser',
      email: 'invalid-email',
      password: 'Password00123@',
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
  //user login

  it('should log in a user', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'Johndoe@example.com',
      password: 'Password00123@',
    });
    const res = await request(app).post('/api/auth/login').send({
      email: 'johndoe@example.com',
      password: 'Password00123@',
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
  it('should not login with incorrect password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'johndoe@example.com',
      password: 'wrongpassword',
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });
});

//Admin Login
describe('Admin Authentication', () => {
  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    await Admin.create({
      name: 'Super Admin',
      email: 'admin@store.com',
      password: hashedPassword,
    });
  });

  it('should login an admin', async () => {
    const res = await request(app).post('/api/admin/login').send({
      email: 'admin@store.com',
      password: 'Admin123!',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app).post('/api/admin/login').send({
      email: 'admin@store.com',
      password: 'wrongpassword',
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });
});
