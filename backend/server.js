// backend/server.js

const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// 1. Connect to MongoDB
connectDB();

const app = express();

// 2. Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 3. CORS configuration (supports local dev and production frontend)
const allowedOrigins = [
  'http://localhost:3000',               // Local React
  process.env.CORS_ORIGIN                // Deployed React, e.g. https://your-frontend.vercel.app
].filter(Boolean);                       // Filter out undefined

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like curl/Postman) or allowedOrigins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests

// 4. Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', env: process.env.NODE_ENV });
});

// 5. Mount API routes (ensure all files exist)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/assets', require('./routes/assetRoutes'));
app.use('/api/risks', require('./routes/riskRoutes'));
app.use('/api/controls', require('./routes/controlRoutes'));
app.use('/api/frameworks', require('./routes/frameworkRoutes'));
app.use('/api/policies', require('./routes/policyRoutes'));
app.use('/api/evidence', require('./routes/evidenceRoutes'));
app.use('/api/audits', require('./routes/auditRoutes'));
app.use('/api/bcm', require('./routes/bcmRoutes'));

// 6. Root route (friendly message)
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the GRC Enterprise API!' });
});

// 7. Error handling middleware (should always be last)
app.use(errorHandler);

// 8. Start server (REQUIRED for Render/Railway/Heroku)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
