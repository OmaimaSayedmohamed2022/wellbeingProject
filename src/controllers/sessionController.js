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
];

export const createSession = async (req, res) => {
  try {
    const { description, sessionDate, sessionType, category, subcategory } = req.body;

    // Validate if sessionDate is a valid date
    if (!moment(sessionDate, moment.ISO_8601, true).isValid()) {
      return res.status(400).send({ error: 'Invalid date format' });
    }

    // Ensure the selected time is in the future
    if (moment(sessionDate).isBefore(moment())) {
      return res.status(400).send({ error: 'Cannot schedule in the past' });
    }

    // Check if the selected time is available
    if (!availableSlots.includes(sessionDate)) {
      return res.status(400).send({ error: 'Selected time is not available' });
    }

    // Validate session type
    if (!sessionTypes.includes(sessionType)) {
      return res.status(400).send({ error: 'Invalid session type' });
    }

    // Validate category
    if (!['mentalHealth', 'physicalHealth', 'skillsDevelopment'].includes(category)) {
      return res.status(400).send({ error: 'Invalid category' });
    }

    // Validate subcategory if category requires it
    if (category === 'mentalHealth' && !subcategory) {
      return res.status(400).send({ error: 'Subcategory is required for mentalHealth' });
    }

    // Check if the subcategory exists in the provided category
    if (category === 'mentalHealth' && subcategory) {
      const validSubcategories = categories.mentalHealth
        .filter(item => typeof item === 'object') // Only objects have subcategories
        .map(item => item.subcategory)
        .flat(); // Flatten nested arrays
      if (!validSubcategories.includes(subcategory)) {
        return res.status(400).send({ error: 'Invalid subcategory for mentalHealth' });
      }
    }

    // Ensure the authenticated beneficiary exists
    if (!req.beneficiary) {
      return res.status(403).send({ error: 'Unauthorized request. No beneficiary found.' });
    }

    // Create a new session object
    const newSession = new Session({
      description,
      sessionType,
      category,
      subcategory,
      sessionDate,
      status: 'Scheduled',
      beneficiary: req.beneficiary.id, 
    });

    // Save the new session to the database
    await newSession.save();

    // Add session ID to the beneficiary's session list
    req.beneficiary.sessions.push(newSession._id);
    await req.beneficiary.save();

    // Return the success response with the session details
    res.status(201).send({
      message: 'New session created successfully',
      session: newSession,
    });

  } catch (error) {
    res.status(500).send({ message: 'Error in creating session', error: error.message });
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

