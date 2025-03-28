// Create a __mocks__ directory in your project
// Add this file as __mocks__/Admin.ts

import mongoose from 'mongoose';

const ADMIN_TEST_ID = new mongoose.Types.ObjectId().toString();

export const AdminModel = {
  findById: jest.fn((id) => {
    if (id === ADMIN_TEST_ID) {
      return Promise.resolve({
        _id: ADMIN_TEST_ID,
        email: 'admin@test.com',
        name: 'Test Admin',
      });
    }
    return Promise.resolve(null);
  }),
  // Add other methods used by your app
};

// Export the test ID so it can be used in your test file
export const TEST_ADMIN_ID = ADMIN_TEST_ID;
