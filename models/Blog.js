const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    body: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    state: { type: String, enum: ['draft', 'published'], default: 'draft' },
    read_count: { type: Number, default: 0 },
    reading_time: { type: Number },
    tags: [String],
  },
  { timestamps: true }
);

// Calculate reading time before saving – async hook, no `next` parameter
blogSchema.pre('save', async function () {
  try {
    if (this.isModified('body')) {
      const wordCount = this.body.split(/\s+/).length;
      const wordsPerMinute = 200;
      this.reading_time = Math.ceil(wordCount / wordsPerMinute);
    }
    // No `next()` call – just let the async function return
  } catch (error) {
    // Throw error to let Mongoose handle it
    throw error;
  }
});

module.exports = mongoose.model('Blog', blogSchema);