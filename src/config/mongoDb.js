import mongoose from 'mongoose';
import logger from './logger.js';

const connectDB = async () => {
  try {
      await mongoose.connect(process.env.MONGO_URI, { 
        useNewUrlParser: true,
        useUnifiedTopology: true 
        });

      logger.info('MongoDB connected successfully');
  } catch (error) {
      logger.error(`Error: ${error.message}`);
      process.exit(1); // Exit the process if the connection fails
  }
};



export default connectDB;

