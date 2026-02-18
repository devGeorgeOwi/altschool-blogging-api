# Blogging API

## AltSchool Africa -- Backend NodeJS Second Semester Examination

------------------------------------------------------------------------

## 📌 Project Description

This Blogging API is a fully-featured RESTful backend application
designed to demonstrate mastery of core backend engineering concepts
using Node.js and Express.

The system allows users to register, authenticate securely using JWT,
and manage blog posts with proper access control. Public users can
access only published blogs, while authenticated users can create, edit,
publish, or delete their own blog posts.

This project demonstrates:

-   REST API architecture
-   Secure authentication and authorization
-   Proper database modeling using Mongoose
-   Pagination, filtering, and sorting implementation
-   Clean MVC architecture separation
-   Middleware usage
-   Environment-based configuration
-   Deployment readiness

Special attention was given to writing clean, modular, and scalable code
structure to reflect real-world backend engineering practices.

------------------------------------------------------------------------

## 🚀 Live Deployment

Base URL: https://altschool-blogging-api-1c6f.onrender.com
(Update with your actual deployed link)

------------------------------------------------------------------------

## 🛠 Tech Stack

-   Node.js
-   Express.js
-   MongoDB Atlas
-   Mongoose ODM
-   JSON Web Token (JWT)
-   bcryptjs
-   Render (Deployment)

------------------------------------------------------------------------

## 📁 Project Structure

    ├── config/
    │   └── db.js
    ├── controllers/
    │   ├── authController.js
    │   └── blogController.js
    ├── middleware/
    │   └── auth.js
    ├── models/
    │   ├── User.js
    │   └── Blog.js
    ├── routes/
    │   ├── authRoutes.js
    │   └── blogRoutes.js
    ├── tests/
    ├── .env.example
    ├── app.js
    ├── server.js
    ├── package.json
    └── README.md

The project follows the MVC pattern to ensure maintainability and
separation of concerns.

------------------------------------------------------------------------

## 🔐 Authentication & Authorization

-   JWT Token expires after 1 hour
-   Passwords hashed using bcrypt
-   Protected routes secured with middleware
-   Owner-only blog modification enforced at controller level

Authorization Header Format:

Authorization: Bearer `<token>`{=html}

------------------------------------------------------------------------

## 📬 API Endpoints Summary

### Authentication

  Method   Endpoint           Description
  -------- ------------------ ---------------------
  POST     /api/auth/signup   Register a new user
  POST     /api/auth/signin   Login user

------------------------------------------------------------------------

### Public Blog Endpoints

  Method   Endpoint         Description
  -------- ---------------- ---------------------------
  GET      /api/blogs       Get all published blogs
  GET      /api/blogs/:id   Get single published blog

Features Implemented:

-   Pagination (default 20 per page)
-   Search by title, author, tags
-   Sorting by read_count, reading_time, createdAt
-   Order control (asc/desc)
-   Read count increment on single blog fetch

------------------------------------------------------------------------

### Protected Blog Endpoints

  Method   Endpoint             Description
  -------- -------------------- ------------------------------
  POST     /api/blogs           Create blog (default: draft)
  GET      /api/blogs/user/me   Get current user's blogs
  PUT      /api/blogs/:id       Update blog (owner only)
  DELETE   /api/blogs/:id       Delete blog (owner only)

------------------------------------------------------------------------

## 📊 Reading Time Algorithm

Reading time is calculated using an average reading speed of 200 words
per minute.

const wordCount = body.split(/`\s`{=tex}+/).length; const wordsPerMinute
= 200; reading_time = Math.ceil(wordCount / wordsPerMinute);

------------------------------------------------------------------------

## 🧪 Postman API Collection

A complete Postman collection is provided for easy testing of all
endpoints.

Postman Collection Link: (Add your exported Postman collection link
here)

Testing Flow:

1.  Signup
2.  Signin
3.  Copy JWT token
4.  Create blog (draft)
5.  Publish blog
6.  Test public endpoints
7.  Test pagination, search, sorting

------------------------------------------------------------------------

## ✅ AltSchool Requirements Checklist

✔ User model with required fields\
✔ Signup endpoint\
✔ Signin endpoint\
✔ JWT authentication (1-hour expiry)\
✔ Draft and Published states\
✔ Public access to published blogs\
✔ Owner-only update and delete\
✔ Pagination implemented (default 20)\
✔ Search by title, author, tags\
✔ Sorting by read_count, reading_time, createdAt\
✔ Reading time calculation\
✔ Read count increment on single blog fetch\
✔ Postman collection for testing

------------------------------------------------------------------------

## 🌍 Environment Variables

  Variable      Required   Description
  ------------- ---------- ---------------------------
  MONGODB_URI   Yes        MongoDB connection string
  JWT_SECRET    Yes        Secret for JWT signing
  PORT          No         Server port
  NODE_ENV      No         Environment type

------------------------------------------------------------------------

## 📄 License

This project was created strictly for educational purposes as part of
the AltSchool Africa Backend NodeJS Second Semester Examination.

------------------------------------------------------------------------

## 👨‍💻 Author

George Owoicho\
AltSchool Africa Backend Student\
GitHub: https://github.com/devGeorgeOwi/altschool-blogging-api
