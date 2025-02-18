import { metastore } from 'googleapis/build/src/apis/metastore/index.js';
import logger from '../config/logger.js';
import Session from '../models/sessionModel.js';
import moment from 'moment'
import { categories } from '../constants/categories.js';
import axios from 'axios';
// Mocked session types
const sessionTypes = ['جلسة فورية', 'جلسة مجانية'];

// Controller to fetch session types
export const getSessionTypes = (req, res) => {
  res.json(sessionTypes);
};



const availableSlots = [
  '2025-01-20T09:00',
  '2025-01-20T14:30',
  '2025-01-21T10:00',
  "2025-01-23T14:30"
];

export const createSession = async (req, res) => {
  try {
    const { description, sessionDate, sessionType, category, subcategory,paymentDetails,paymentStatus } = req.body;

    // Ensure the authenticated beneficiary exists
    if (!req.beneficiary) {
      return res.status(403).send({ error: 'Unauthorized request. No beneficiary found.' });
    }

    // Create a new session
    const newSession = new Session({
      beneficiary: req.beneficiary._id,
      sessionDate,
      sessionType,
      category,
      subcategory,
      description,
      paymentStatus,
      paymentDetails
    });

    await newSession.save();

    res.status(201).send({
      message: 'Session created successfully.',
      session: newSession,
    });
    logger.info(`New session created: ${newSession._id}`);
  } catch (error) {
    logger.error(`Error creating session: ${error.message}`);
    res.status(500).send({ error: 'Internal server error', details: error.message });
  }
};


export const countSessions = async (req, res) => {
  try {
    const count = await Session.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error counting session", error: error.message });
  }
};








// export const processPayment = async (req, res) => {
//   try {
//     const { amount, cardDetails, sessionId } = req.body;

//     // Validate the incoming data (amount, cardDetails, etc.)
//     if (!amount || !cardDetails || !sessionId) {
//       return res.status(400).send({ error: 'Missing required payment details' });
//     }

//     // Prepare payment request payload
//     const payload = {
//       amount, // Payment amount in USD or LBP
//       currency: 'USD', // or 'LBP'
//       cardDetails, // Include card number, CVV, expiry date (ensure it's tokenized if possible)
//       description: 'Payment for session',
//       sessionId,
//     };

//     // Send payment request to Audi Bank's gateway
//     const response = await axios.post('https://audi-bank-payment-gateway-url', payload, {
//       headers: {
//         Authorization: `Bearer ${process.env.AUDI_BANK_API_KEY}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     // Handle the bank's response
//     if (response.data.success) {
//       // Update session status to 'Paid'
//       const session = await Session.findById(sessionId);
//       if (!session) {
//         return res.status(404).send({ error: 'Session not found' });
//       }

//       session.status = 'Paid';
//       session.paymentDetails = response.data.transactionDetails;
//       await session.save();

//       return res.status(200).send({
//         message: 'Payment successful',
//         transactionDetails: response.data.transactionDetails,
//       });
//     } else {
//       return res.status(400).send({ error: 'Payment failed', details: response.data.error });
//     }
//   } catch (error) {
//     console.error('Payment processing error:', error);  // Log the error for debugging
//     return res.status(500).send({ error: 'Internal server error' });
//   }
// };

