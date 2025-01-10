import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import connectDB from './src/config/mongoDb.js';
import beneficiaryRouter from './src/routers/beneficiaryRouter.js';
import authRouter from './src/routers/authRouter.js';
import SpecialistRouter from './src/routers/specialistRouter.js';
import  resetPasswordRouter  from './src/routers/resetPasswordRouter.js';
import categoriesRouter from './src/routers/categoriesRouter.js';
import sessionRouter from './src/routers/sessionRouter.js';
import logger from './src/config/logger.js';
import cors from 'cors'


dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

app.use(morgan('combined', {
    skip: (req, res) => process.env.NODE_ENV === 'production' && res.statusCode < 400,
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }));
  

connectDB();

app.use('/api/beneficiaries', beneficiaryRouter);
app.use('/api/auth', authRouter);
app.use('/api/specialist', SpecialistRouter);
app.use('/api/resetPassword', resetPasswordRouter);

app.use('/api/categories', categoriesRouter);
app.use('/api/sessions', sessionRouter);


const PORT = process.env.PORT || 5005;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));

