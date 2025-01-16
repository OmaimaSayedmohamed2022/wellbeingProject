import jwt from 'jsonwebtoken';
import { Beneficiary } from '../models/beneficiaryModel.js';
import logger from '../config/logger.js';

export async function verifyToken(req, res, next) {

    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
  
    // console.log('Auth Header:', req.headers.authorization);
    // console.log('Token:', token);
    if (!token) {
      return res.status(401).send({ error: 'No token provided' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      const beneficiary = await Beneficiary.findById(decoded.id);
   
      // console.log('Beneficiary:', beneficiary);
  
      if (!beneficiary) {
        return res.status(403).send({ error: 'Beneficiary not found' });
      }
  
      req.beneficiary = beneficiary;
      next();
    } catch (error) {
      return res.status(403).send({ error: 'Invalid or expired token' });
    }
  };