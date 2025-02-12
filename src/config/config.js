export default {
    port: process.env.PORT || 5005,
    env: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/your-db-name',
    jwtSecret: process.env.JWT_SECRET || process.env.JWT_SECRET,
  };