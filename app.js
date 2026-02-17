require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// ✅ ADD THIS ROOT ROUTE
app.get('/', (req, res) => {
  res.json({ 
    message: 'Blogging API is running!',
    endpoints: {
      auth: {
        signup: 'POST /api/auth/signup',
        signin: 'POST /api/auth/signin'
      },
      blogs: {
        getAll: 'GET /api/blogs',
        getOne: 'GET /api/blogs/:id',
        create: 'POST /api/blogs',
        userBlogs: 'GET /api/blogs/user/me',
        update: 'PUT /api/blogs/:id',
        delete: 'DELETE /api/blogs/:id'
      }
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app;