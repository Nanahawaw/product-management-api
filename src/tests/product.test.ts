import request from 'supertest';
import app from '../app';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-for-development';

// Generate an admin token with role
const generateAdminToken = () => {
  return jwt.sign(
    {
      id: 'admin-user-id',
      role: 'admin', // Include the role
    },
    JWT_SECRET,
    {
      expiresIn: '1h',
    }
  );
};

// Generate a non-admin token
const generateNonAdminToken = () => {
  return jwt.sign(
    {
      id: 'regular-user-id',
    },
    JWT_SECRET,
    {
      expiresIn: '1h',
    }
  );
};
describe('Product Routes', () => {
  const adminToken = generateAdminToken();
  const nonAdminToken = generateNonAdminToken();
  it('should create a product for admin', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Product',
        price: 10000,
        description: 'A test product',
        quantity: 10, // Fixed typo: quanity → quantity
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('name', 'Test Product');
  });

  it('should prevent non-admin from creating a product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${nonAdminToken}`)
      .send({
        name: 'Test Product',
        description: 'A test product',
        price: 99.99,
        quantity: 10,
      });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('message');
  });

  it('should reject product creation without token', async () => {
    const res = await request(app).post('/api/products').send({
      name: 'Test Product',
      description: 'A test product',
      price: 99.99,
      quantity: 10,
    });

    expect(res.status).toBe(401);
  });

  it('should get all products', async () => {
    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Modified to ensure we have a product to test with
  it('should get a product by ID', async () => {
    // First create a product to ensure there's something to fetch
    const createRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Product to Fetch',
        price: 15000,
        description: 'A product to fetch by ID',
        quantity: 5,
      });

    // Now fetch it by ID
    const productId = createRes.body._id || 1;
    const res = await request(app).get(`/api/products/${productId}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('name');
  });

  it('should update a product for admin', async () => {
    // First create a product to ensure there's something to update
    const createRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Product to Update',
        price: 20000,
        description: 'A product to update',
        quantity: 15,
      });

    const productId = createRes.body._id || 1;

    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Updated Product',
        description: 'Updated description',
        price: 129.99,
        quantity: 20,
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'Updated Product');
  });

  it('should prevent non-admin from updating a product', async () => {
    // Use the product created in previous test
    const getAllRes = await request(app).get('/api/products');
    const productId = getAllRes.body[0]?.id || 1;

    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${nonAdminToken}`)
      .send({
        name: 'Updated Product',
        description: 'Updated description',
        price: 129.99,
        quantity: 20,
      });

    expect(res.status).toBe(403);
  });

  it('should delete a product for admin', async () => {
    // First create a product to ensure there's something to delete
    const createRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Product to Delete',
        price: 30000,
        description: 'A product to delete',
        quantity: 25,
      });

    const productId = createRes.body._id || 1;

    const res = await request(app)
      .delete(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Product deleted successfully');
  });

  it('should prevent non-admin from deleting a product', async () => {
    // Create another product for this test
    const createRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Another Product to Not Delete',
        price: 40000,
        description: 'Should not be deleted by non-admin',
        quantity: 30,
      });

    const productId = createRes.body._id || 1;

    const res = await request(app)
      .delete(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${nonAdminToken}`);

    expect(res.status).toBe(403);
  });

  // Add a cleanup test to ensure tests close properly
  afterAll((done) => {
    // Close any open handles
    setTimeout(() => {
      done();
    }, 500);
  });
});
