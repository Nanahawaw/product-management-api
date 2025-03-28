import request from 'supertest';
import app from '../app';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-for-development';

const generateAdminToken = () => {
  return jwt.sign(
    {
      id: 'admin-user-id',
      role: 'admin',
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

  // Store created product IDs for later tests
  let testProductId;

  it('should create a product for admin', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Test Product ${Date.now()}`, // Unique name for each test
        price: 10000,
        description: 'A test product',
        quantity: 10,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('name');
    expect(res.body).toHaveProperty('price');
    expect(res.body).toHaveProperty('description');
    expect(res.body).toHaveProperty('quantity');

    // Save the created product ID for later tests
    testProductId = res.body._id;
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

  it('should get a product by ID', async () => {
    // Make sure we have a valid product ID to use
    if (!testProductId) {
      const createRes = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Product to Fetch',
          price: 15000,
          description: 'A product to fetch by ID',
          quantity: 5,
        });

      testProductId = createRes.body._id;
    }

    // Now try to fetch the product
    const res = await request(app).get(`/api/products/${testProductId}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('name');
  }, 10000); // Increase timeout to 10 seconds

  it('should update a product for admin', async () => {
    // Make sure we have a valid product ID to use
    if (!testProductId) {
      const createRes = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Product to Update',
          price: 20000,
          description: 'A product to update',
          quantity: 15,
        });

      testProductId = createRes.body._id;
    }

    const res = await request(app)
      .put(`/api/products/${testProductId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Updated Product',
        description: 'Updated description',
        price: 129.99,
        quantity: 20,
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'Updated Product');
  }, 10000); // Increase timeout to 10 seconds

  it('should reject creating a product with duplicate name', async () => {
    const uniqueName = `Unique Product Name ${Date.now()}`; // Ensure unique name
    const firstProduct = {
      name: uniqueName,
      price: 10000,
      description: 'A test product',
      quantity: 10,
    };

    await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(firstProduct);

    // Try to create another product with the same name
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(firstProduct);

    // Should reject with 400 Bad Request
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Product name already exists');
  }, 10000);

  it('should prevent non-admin from updating a product', async () => {
    // Make sure we have a valid product ID to use
    if (!testProductId) {
      // Get all products and use the first one
      const getAllRes = await request(app).get('/api/products');
      testProductId = getAllRes.body[0]?._id;

      // If still no product found, create one
      if (!testProductId) {
        const createRes = await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: 'Product for Non-Admin Test',
            price: 20000,
            description: 'A test product',
            quantity: 15,
          });

        testProductId = createRes.body._id;
      }
    }

    const res = await request(app)
      .put(`/api/products/${testProductId}`)
      .set('Authorization', `Bearer ${nonAdminToken}`)
      .send({
        name: 'Updated Product',
        description: 'Updated description',
        price: 129.99,
        quantity: 20,
      });

    expect(res.status).toBe(403);
  }, 10000);

  it('should delete a product for admin', async () => {
    // Create a new product specifically for deletion
    const createRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Product to Delete ${Date.now()}`, // Ensure unique name
        price: 30000,
        description: 'A product to delete',
        quantity: 25,
      });

    const productId = createRes.body._id;

    // Verify that productId exists before proceeding
    expect(productId).toBeDefined();

    const res = await request(app)
      .delete(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Product deleted successfully');
  }, 10000); // Increase timeout to 10 seconds

  it('should prevent non-admin from deleting a product', async () => {
    // Create a new product specifically for this test
    const createRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Another Product ${Date.now()}`, // Ensure unique name
        price: 40000,
        description: 'Should not be deleted by non-admin',
        quantity: 30,
      });

    const productId = createRes.body._id;

    // Verify that productId exists before proceeding
    expect(productId).toBeDefined();

    const res = await request(app)
      .delete(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${nonAdminToken}`);

    expect(res.status).toBe(403);
  }, 10000); // Increase timeout to 10 seconds

  // Add proper cleanup to avoid test timeout issues
  afterAll(async () => {
    // Add any necessary cleanup here if needed
    return new Promise((resolve) => setTimeout(resolve, 500));
  });
});
