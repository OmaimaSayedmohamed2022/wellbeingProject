import jwt from 'jsonwebtoken';
import { Beneficiary } from '../models/beneficiaryModel.js';
import logger from '../utils/logger.js';

export async function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    logger.warn('Access denied - Token not found');
    return res.status(401).json({ message: 'Token not found' });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Beneficiary.findById(decodedToken.id);

    if (!user) {
      logger.warn('Access denied - User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Error in verifyToken:', error);
    return res.status(403).json({ message: 'Token invalid' });
  }
}