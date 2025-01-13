import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Beneficiary } from '../models/beneficiaryModel.js';
import Specialist  from '../models/specialistModel.js';
import logger from '../config/logger.js';

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists in Beneficiary collection
    let user = await Beneficiary.findOne({ email });
    let userType = 'Beneficiary';
    
    if (!user) {
      user = await Specialist.findOne({ email });
      userType = 'Specialist';
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
        role: user.role || userType, // Use `userType` if role is not defined
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
  } catch (error) {
    logger.error('Error in loginUser:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};
