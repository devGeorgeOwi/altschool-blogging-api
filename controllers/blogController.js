const Blog = require('../models/Blog');
const User = require('../models/User');

// Helper to build search query for public blogs
const buildPublicQuery = (req) => {
  const { search, author, title, tags } = req.query;
  let query = { state: 'published' };

  if (search) {
    // Search across title, description, body, tags, and author's name via aggregation
    // We'll handle search via aggregation later to include author name
  }
  if (title) {
    query.title = { $regex: title, $options: 'i' };
  }
  if (tags) {
    const tagArray = tags.split(',').map(tag => tag.trim());
    query.tags = { $in: tagArray };
  }
  if (author) {
    // We need to find users whose first_name or last_name matches the author query
    // Then filter blogs by author ids
    // This will be handled in the controller
  }
  return query;
};

// @desc    Get all published blogs (public)
// @route   GET /api/blogs
// @access  Public
const getPublishedBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = { state: 'published' };
    let authorIds = [];

    // Handle author search separately
    if (req.query.author) {
      const users = await User.find({
        $or: [
          { first_name: { $regex: req.query.author, $options: 'i' } },
          { last_name: { $regex: req.query.author, $options: 'i' } },
        ],
      }).select('_id');
      authorIds = users.map(u => u._id);
      if (authorIds.length === 0) {
        // No matching authors, return empty result
        return res.json({ blogs: [], totalPages: 0, currentPage: page, totalBlogs: 0 });
      }
      query.author = { $in: authorIds };
    }

    if (req.query.title) {
      query.title = { $regex: req.query.title, $options: 'i' };
    }

    if (req.query.tags) {
      const tagArray = req.query.tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Sorting
    const sortField = req.query.sort || 'createdAt'; // allowed: read_count, reading_time, createdAt (timestamp)
    const sortOrder = req.query.order === 'asc' ? 1 : -1;
    let sort = {};
    if (['read_count', 'reading_time', 'createdAt'].includes(sortField)) {
      sort[sortField] = sortOrder;
    } else {
      sort = { createdAt: -1 }; // default
    }

    const blogs = await Blog.find(query)
      .populate('author', 'first_name last_name email')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalBlogs = await Blog.countDocuments(query);
    const totalPages = Math.ceil(totalBlogs / limit);

    res.json({
      blogs,
      totalPages,
      currentPage: page,
      totalBlogs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single published blog (public)
// @route   GET /api/blogs/:id
// @access  Public
const getPublishedBlogById = async (req, res) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id, state: 'published' }).populate(
      'author',
      'first_name last_name email'
    );

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Increment read_count
    blog.read_count += 1;
    await blog.save();

    res.json(blog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new blog (draft)
// @route   POST /api/blogs
// @access  Private
const createBlog = async (req, res) => {
  try {
    const { title, description, body, tags } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required' });
    }

    // Check for duplicate title
    const existing = await Blog.findOne({ title });
    if (existing) {
      return res.status(400).json({ message: 'Blog with this title already exists' });
    }

    const blog = await Blog.create({
      title,
      description,
      body,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      author: req.user._id,
      state: 'draft',
    });

    res.status(201).json(blog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get blogs of logged-in user (paginated, filter by state)
// @route   GET /api/users/me/blogs
// @access  Private
const getUserBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = { author: req.user._id };
    if (req.query.state && ['draft', 'published'].includes(req.query.state)) {
      query.state = req.query.state;
    }

    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalBlogs = await Blog.countDocuments(query);
    const totalPages = Math.ceil(totalBlogs / limit);

    res.json({
      blogs,
      totalPages,
      currentPage: page,
      totalBlogs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a blog (owner only)
// @route   PUT /api/blogs/:id
// @access  Private
const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check ownership
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this blog' });
    }

    const { title, description, body, tags, state } = req.body;

    if (title && title !== blog.title) {
      const existing = await Blog.findOne({ title });
      if (existing) {
        return res.status(400).json({ message: 'Blog with this title already exists' });
      }
      blog.title = title;
    }

    if (description !== undefined) blog.description = description;
    if (body !== undefined) blog.body = body;
    if (tags !== undefined) blog.tags = tags.split(',').map(t => t.trim());
    if (state && ['draft', 'published'].includes(state)) {
      blog.state = state;
    }

    await blog.save();

    res.json(blog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a blog (owner only)
// @route   DELETE /api/blogs/:id
// @access  Private
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this blog' });
    }

    await blog.deleteOne();

    res.json({ message: 'Blog removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getPublishedBlogs,
  getPublishedBlogById,
  createBlog,
  getUserBlogs,
  updateBlog,
  deleteBlog,
};