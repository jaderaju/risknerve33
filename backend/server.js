const express = require('express');
const dotenv = require('dotenv').config();
const colors = require('colors');
const cors = require('cors'); // Keep only one import
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const assetRoutes = require('./routes/assetRoutes');
const riskRoutes = require('./routes/riskRoutes');
const controlRoutes = require('./routes/controlRoutes');
const frameworkRoutes = require('./routes/frameworkRoutes');
const policyRoutes = require('./routes/policyRoutes');
const evidenceRoutes = require('./routes/evidenceRoutes');
const auditRoutes = require('./routes/auditRoutes');
const bcmRoutes = require('./routes/bcmRoutes');

const port = process.env.PORT || 5000;

connectDB(); // Connect to MongoDB

const app = express();

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable CORS for allowed origins (using specific config as discussed previously)
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:3000', // For local frontend development
            process.env.CORS_ORIGIN // Your deployed Vercel frontend URL from Vercel env var
        ];
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow these methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
    credentials: true // Allow cookies/auth headers to be sent
};
app.use(cors(corsOptions)); // Use CORS middleware with options

// Mount all routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/risks', riskRoutes);
app.use('/api/controls', controlRoutes);
app.use('/api/frameworks', frameworkRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api/bcm', bcmRoutes);

// Basic route for testing
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to the GRC Enterprise API!' });
});

// Use custom error handler
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server running on port ${port}`.yellow.bold);
    console.log(`Environment: ${process.env.NODE_ENV}`.magenta);
});
