import request from 'supertest';
import app from '../app';

describe('Auth Routes', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'JDoe',
        email: `newuser_${Date.now()}@example.com`,
        password: 'Password',
      });
    console.log(res.body);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message', 'User registered successfully');
  });

  it('should prevent registering with an existing email', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Unique User',
      email: 'existing@example.com',
      password: 'Password00123@',
    });

    const res = await request(app).post('/api/auth/register').send({
      name: 'Another User',
      email: 'existing@example.com',
      password: 'Password00123@',
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'User already exists');
  });

  it('should reject invalid email format', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Invalid Email User',
      email: 'invalid-email',
      password: 'Password00123@',
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('should log in a user', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'John Doe',
      email: 'johndoe@example.com',
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
