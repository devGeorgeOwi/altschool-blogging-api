const express = require('express');
const {
  getPublishedBlogs,
  getPublishedBlogById,
  createBlog,
  getUserBlogs,
  updateBlog,
  deleteBlog,
} = require('../controllers/blogController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getPublishedBlogs);
router.get('/:id', getPublishedBlogById);

// Protected routes
router.post('/', protect, createBlog);
router.get('/user/me', protect, getUserBlogs); // note: path is /api/blogs/user/me
router.put('/:id', protect, updateBlog);
router.delete('/:id', protect, deleteBlog);

module.exports = router;