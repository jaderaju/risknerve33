const mongoose = require('mongoose');

console.log('MONGO_URI at startup:', process.env.MONGO_URI); // <--- Add this line!
console.log('DEBUG_MONGO_URI:', process.env.DEBUG_MONGO_URI);
let conn = null;

const connectDB = async () => {
  if (conn) return;
  try {
    conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

module.exports = connectDB;
