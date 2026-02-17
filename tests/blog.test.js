const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');
const Blog = require('../models/Blog');

let token;
let userId;
let blogId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await User.deleteMany({});
  await Blog.deleteMany({});

  // Create a user and get token
  const userRes = await request(app)
    .post('/api/auth/signup')
    .send({
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      password: 'password123',
    });
  token = userRes.body.token;
  userId = userRes.body._id;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Blog Endpoints', () => {
  it('should create a new blog (draft)', async () => {
    const res = await request(app)
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'My First Blog',
        description: 'A test blog',
        body: 'This is the content of the blog. It has several words to calculate reading time.',
        tags: 'test,blog',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('My First Blog');
    expect(res.body.state).toBe('draft');
    expect(res.body.reading_time).toBe(1); // depends on word count
    blogId = res.body._id;
  });

  it('should not create a blog with duplicate title', async () => {
    const res = await request(app)
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'My First Blog',
        body: 'Another content',
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Blog with this title already exists');
  });

  it('should get user blogs (paginated)', async () => {
    const res = await request(app)
      .get('/api/blogs/user/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.blogs).toHaveLength(1);
    expect(res.body.totalBlogs).toBe(1);
  });

  it('should update blog (publish it)', async () => {
    const res = await request(app)
      .put(`/api/blogs/${blogId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        state: 'published',
        title: 'Updated Title',
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.state).toBe('published');
    expect(res.body.title).toBe('Updated Title');
  });

  it('should get published blogs (public)', async () => {
    const res = await request(app).get('/api/blogs');
    expect(res.statusCode).toBe(200);
    expect(res.body.blogs).toHaveLength(1);
    expect(res.body.blogs[0].state).toBe('published');
  });

  it('should get a single published blog and increment read_count', async () => {
    const res = await request(app).get(`/api/blogs/${blogId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.read_count).toBe(1);
    expect(res.body.author).toHaveProperty('first_name');
  });

  it('should delete blog', async () => {
    const res = await request(app)
      .delete(`/api/blogs/${blogId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Blog removed');
  });
});