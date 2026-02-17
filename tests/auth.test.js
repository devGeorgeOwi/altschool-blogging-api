const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Auth Endpoints', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('should sign up a new user', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.email).toBe('john@example.com');
  });

  it('should not sign up with existing email', async () => {
    await User.create({
      first_name: 'Jane',
      last_name: 'Doe',
      email: 'jane@example.com',
      password: 'password123',
    });

    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'jane@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('User already exists');
  });

  it('should sign in an existing user', async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      });

    const res = await request(app)
      .post('/api/auth/signin')
      .send({
        email: 'john@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should not sign in with wrong password', async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      });

    const res = await request(app)
      .post('/api/auth/signin')
      .send({
        email: 'john@example.com',
        password: 'wrongpassword',
      });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });
});