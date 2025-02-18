import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Beneficiary } from '../models/beneficiaryModel.js';
import Specialist  from '../models/specialistModel.js';
import { Admin } from '../models/adminModel.js';
import logger from '../config/logger.js';

export const loginUser = async (req, res) => {
  const { email, password ,role} = req.body;

  try {
    // Check if the user exists in Beneficiary collection
    let user = await Beneficiary.findOne({ email });
    let userType = 'Beneficiary';
    
    if (!user) {
      user = await Specialist.findOne({ email });
      userType = 'Specialist';
    }

    if (!user) {
      user = await Admin.findOne({ email }); 
      userType = 'Admin';
    }

    if (!user) {
      logger.warn(`Login failed for email: ${email} - User not found.`);
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Invalid password attempt for email: ${email}`);
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role || userType,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    logger.info(`User logged in successfully as ${userType}: ${email}`);

    // Send response
    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role || userType,
      },
    });
  } catch (error) {``
    logger.error('Error in loginUser:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

export const logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      logger.error("Error logging out:", err);
      return res.status(500).json({ message: "Logout failed." });
    }
    res.clearCookie("connect.sid"); // Clear session cookie
    res.status(200).json({ message: "Logged out successfully." });
  });
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