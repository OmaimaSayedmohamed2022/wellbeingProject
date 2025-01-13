import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Beneficiary } from '../models/beneficiaryModel.js';
import logger from '../config/logger.js';

// Login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Beneficiary.findOne({ email });
    if (!user) {
      logger.warn(`Login failed for email: ${email} - User not found.`);
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Invalid password attempt for email: ${email}`);
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    logger.info(`User logged in successfully: ${email}`);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Error in loginUser:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};


const blacklist = new Set();

// Middleware to check if the token is blacklisted
export const isTokenValid = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized. Token is required.' });
    }

    if (blacklist.has(token)) {
        return res.status(401).json({ message: 'Token is invalidated. Please log in again.' });
    }

    next();
};

export const logOutUser = (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(400).json({ message: 'Bad request. Token is missing.' });
        }

        blacklist.add(token);

        res.status(200).json({ status: true, message: 'Logged out successfully.' });
    } catch (error) {
        console.error('Error in logOutUser:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};