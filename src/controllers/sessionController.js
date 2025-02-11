import { metastore } from "googleapis/build/src/apis/metastore/index.js";
import logger from "../config/logger.js";
import Session from "../models/sessionModel.js";
import mongoose from "mongoose";
import moment from "moment";
import { categories } from "../constants/categories.js";
import axios from "axios";
// Mocked session types
const sessionTypes = ["جلسة فورية", "جلسة مجانية"];

// Controller to fetch session types
export const getSessionTypes = (req, res) => {
  res.json(sessionTypes);
};

const availableSlots = [
  "2025-01-20T09:00",
  "2025-01-20T14:30",
  "2025-01-21T10:00",
  "2025-01-23T14:30",
];

export const createSession = async (req, res) => {
  try {
    const {
      description,
      sessionDate,
      sessionType,
      category,
      subcategory,
      beneficiary,
      specialist,
    } = req.body;

    // Ensure the authenticated Session exists
    if (!req.Session) {
      return res
        .status(403)
        .send({ error: "Unauthorized request. No Session found." });
    }

    // Create a new session
    const newSession = new Session({
      Session: req.Session._id,
      sessionDate,
      sessionType,
      category,
      subcategory,
      description,
      beneficiary,
      specialist
    });

    await newSession.save();

    res.status(201).send({
      message: "Session created successfully.",
      session: newSession,
    });
    logger.info(`New session created: ${newSession._id}`);
  } catch (error) {
    logger.error(`Error creating session: ${error.message}`);
    res
      .status(500)
      .send({ error: "Internal server error", details: error.message });
  }
};

// get all sessions
export const getSessions = async (req, res) => {
  try {
    const scheduledSessions = await Session.find()
      .select("sessionDate beneficiary")
      .populate({
        path: "beneficiary",
        select: "firstName lastName age gender nationality profession",
      });
    const completedSessions = await Session.find({ status: "Completed" })
      .select("sessionDate beneficiary")
      .populate({
        path: "beneficiary",
        select: "firstName lastName age gender nationality profession",
      });
    res.status(200).json({ scheduledSessions, completedSessions });
  } catch (error) {
    logger.error("Error in getSessions:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// get scheduled sessions
export const getScheduledSessions = async (req, res) => {
  try {
    const scheduledSessions = await Session.find({
      status: "Scheduled",
    }).select("sessionDate");
    res.status(200).json({ scheduledSessions });
  } catch (error) {
    logger.error("Error in getSessions:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// get completed sessions
export const getCompletedSessions = async (req, res) => {
  try {
    const completedSessions = await Session.find({
      status: "Completed",
    }).select("sessionDate");
    res.status(200).json({ completedSessions });
  } catch (error) {
    logger.error("Error in getSessions:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// get session by id
export const getBeneficiarySessions = async (req, res) => {
  try {
    const { beneficiaryId } = req.params;

    if (!beneficiaryId) {
      return res.status(400).json({ error: "Beneficiary ID is required" });
    }

    const scheduledSessions = await Session.find({
      status: "Scheduled",
      beneficiary: beneficiaryId,
    }).select("sessionDate").populate("beneficiary");

    const completedSessions = await Session.find({
      status: "Completed",
      beneficiary: beneficiaryId,
    }).select("sessionDate").populate("beneficiary");

    res.status(200).json({ scheduledSessions, completedSessions });
  } catch (error) {
    logger.error("Error in getBeneficiarySessions:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getSpecialistSessions = async (req, res) => {      
  try {
    const { specialistId } = req.params;

    if (!specialistId) {
      return res.status(400).json({ error: "specialist ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(specialistId)) {
      logger.warn(`Invalid specialist ID: ${specialistId}`);
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const instantSessions = await Session.find({
      sessionType: "جلسة فورية",
      specialist: specialistId,
    }).populate("beneficiary");

    const freeConsultations = await Session.find({
      sessionType: "جلسة مجانية",
      specialist: specialistId,
    }).populate("beneficiary");

    res.status(200).json({ instantSessions, freeConsultations });
  } catch (error) {
    logger.error("Error in getspecialistSessions:", error);
    res.status(500).json({ error: "Server error" });
  }
};


// update scheduled to completed
export const updateSessionStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { status } = req.body;

    if (status !== "Completed") {
      return res.status(400).json({ error: "Only 'Completed' status is allowed" });
    }

    const session = await Session.findOne({ _id: sessionId, status: "Scheduled" });

    if (!session) {
      return res.status(404).json({ error: "Session not found or not in Scheduled state" });
    }

    session.status = "Completed";
    await session.save();

    res.status(200).json({
      message: "Session moved to Completed Sessions",
      session,
    });

    logger.info(`Session ${sessionId} moved to Completed Sessions`);
  } catch (error) {
    logger.error("Error updating session status:", error);
    res.status(500).json({ error: "Server error", details: error.message });
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
