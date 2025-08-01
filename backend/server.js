const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// 1. Connect to MongoDB (safe for serverless)
connectDB();

const app = express();

// 2. Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 3. CORS configuration (allows local + deployed frontends)
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:3000',
            process.env.CORS_ORIGIN
        ].filter(Boolean); // filter out undefined
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
app.options('*', cors(corsOptions)); // Handle preflight OPTIONS requests

// 4. Health check route (for Vercel/serverless debugging)
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', env: process.env.NODE_ENV });
});

// 5. Mount API routes (make sure all routes exist)
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

// 8. Export the app for Vercel (DO NOT use app.listen())
module.exports = app;
