const express = require('express');
const dotenv = require('dotenv').config();
const colors = require('colors');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Import routes (add userRoutes here)
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes'); // <-- ADD THIS LINE
// const auditRoutes = require('./routes/auditRoutes');
// const controlRoutes = require('./routes/controlRoutes');
// ... etc. for all modules

const port = process.env.PORT || 5000;

connectDB(); // Connect to MongoDB

const app = express();

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable CORS for all origins (adjust for production)
app.use(cors());

// Define basic routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // <-- ADD THIS LINE
// app.use('/api/audits', auditRoutes);
// app.use('/api/controls', controlRoutes);
// ... add more routes as you create them

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
