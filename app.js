import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './src/config/config.js';
import logger from './src/config/logger.js';
import connectDB from './src/config/mongoDb.js';
import routes from './src/routers/index.js';
import { errorHandler } from './src/middlewares/errorHandler.js';
import http from "http";
import {initSocket}  from "./src/config/socketio.js"

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(
  morgan('combined', {
    skip: (req, res) => config.env === 'production' && res.statusCode < 400,
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Database Connection
connectDB();

// Routes
app.use('/api', routes);

// Error Handling Middleware
app.use(errorHandler);

export default app;