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