import jwt from 'jsonwebtoken';
import { Beneficiary } from '../models/beneficiaryModel.js';
import Specialist from '../models/specialistModel.js';
import { Admin } from '../models/adminModel.js';

// Middleware to check if user is authenticated
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user details to request object

    let user = await Admin.findById(req.user.id);
    if (!user) user = await Specialist.findById(req.user.id);
    if (!user) user = await Beneficiary.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    req.user.role = user.role; // Assign role to request object
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Middleware to check if user has a specific role
export const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};
