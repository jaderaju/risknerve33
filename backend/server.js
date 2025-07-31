const express = require('express');
const dotenv = require('dotenv').config();
const colors = require('colors');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:3000', // Local frontend
            process.env.CORS_ORIGIN  // Deployed frontend (e.g., Vercel)
        ];
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
app.options('*', cors(corsOptions)); // ✅ Handle preflight OPTIONS requests

// Mount routes
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

// Root route
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to the GRC Enterprise API!' });
});

// Error handling middleware
app.use(errorHandler);

// ✅ Export the app (IMPORTANT for Vercel)
module.exports = app;
