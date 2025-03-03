
import logger from "../config/logger.js";
import Session from "../models/sessionModel.js";
import mongoose from "mongoose";
import { categories } from "../constants/categories.js";
import Specialist from "../models/specialistModel.js";
import { Beneficiary } from "../models/beneficiaryModel.js";
import moment from "moment"; 

const sessionTypes = ["جلسة فورية", "جلسة مجانية"];

// Controller to fetch session types
export const getSessionTypes = (req, res) => {
  res.json(sessionTypes);
};


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

    console.log("Received sessionDate from request:", sessionDate);

    // Check if the specialist exists
    const specialistDoc = await Specialist.findById(specialist);
    if (!specialistDoc) {
      return res.status(404).json({ error: "Specialist not found." });
    }

    console.log("Specialist found. Available slots:", specialistDoc.availableSlots);

    // Function to normalize date format
    const normalizeDate = (dateString) => {
      const parsedDate = new Date(dateString);
      return isNaN(parsedDate) ? null : parsedDate.toISOString();
    };

    // Convert sessionDate to ISO format
    const parsedSessionDate = normalizeDate(sessionDate);

    if (!parsedSessionDate) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    // Normalize available slots
    const normalizedSlots = specialistDoc.availableSlots
      .map(slot => normalizeDate(slot))
      .filter(slot => slot !== null); // Remove invalid dates

    // Check if the requested date is in available slots
    if (!normalizedSlots.includes(parsedSessionDate)) {
      console.log("Comparison failed! Date not found in available slots.");
      return res.status(400).json({ error: "Selected date is not available." });
    }

    // Remove booked slot from available slots
    specialistDoc.availableSlots = specialistDoc.availableSlots.filter(
      (slot) => normalizeDate(slot) !== parsedSessionDate
    );
    await specialistDoc.save();

    // Convert `sessionDate` to a proper Date object for MongoDB storage
    const sessionDateObj = moment.utc(parsedSessionDate).toDate();

    console.log("Final sessionDate to be saved:", sessionDateObj);

    // Create a new session
    const newSession = new Session({
      sessionDate: sessionDateObj,
      sessionType,
      category,
      subcategory,
      description,
      beneficiary,
      specialist,
    });

    await newSession.save();

    console.log("Session created successfully:", newSession);

    // Add session to specialist's session list
    await Specialist.findByIdAndUpdate(
      specialist,
      { $push: { sessions: newSession._id } },
      { new: true, runValidators: false }
    );
    
    await Beneficiary.findByIdAndUpdate(
      beneficiary,
      { $push: { sessions: newSession._id } },
      { new: true, runValidators: false }
    );
    res.status(201).json({
      message: "Session created successfully.",
      session: newSession,
    });
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

// get session by id
export const getSessionById= async(req,res)=>{
  const {id} = req.params
  try{
  const session = await Session.findById(id)
  res.status(200).json({message:"session fetched successfuly",session})
  }catch(error){
    logger.error("Error in getSession:", error);
    res.status(500).json({ error: "Server error" });

  }
}

export const getSessionsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ["Scheduled", "Completed", "Pending", "Canceled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid session status" });
    }

    const sessions = await Session.find({ status }).populate("beneficiary specialist");

    res.status(200).json({ sessions });
  } catch (error) {
    logger.error(`Error fetching ${status} sessions:`, error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
};


// // Get Scheduled Sessions
// export const getScheduledSessions = async (req, res) => {
//   try {
//     const scheduledSessions = await Session.find() // Query by status
//       .select("sessionDate specialist")
//       .populate({
//         path: "specialist",
//         select: "firstName lastName imageUrl",
//       });

//     res.status(200).json({ scheduledSessions });
//   } catch (error) {
//     logger.error("Error fetching scheduled sessions:", error);
//     res.status(500).json({ error: "Server error", message: error.message });
//   }
// };

// // Get Completed Sessions
export const getCompletedSessions = async (req, res) => {
  try {
    const completedSessions = await Session.find({ status: "Completed" })
      .select("sessionDate beneficiary")
      .populate({
        path: "beneficiary",
        select: "firstName lastName age gender nationality imageUrl",
      });

    res.status(200).json({ completedSessions });
  } catch (error) {
    logger.error("Error fetching completed sessions:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// // Get Pending Sessions
// export const getPendingSessions = async (req, res) => {
//   try {
//     const pendingSessions = await Session.find({ status: "Pending" })
//       .select("sessionDate beneficiary")
//       .populate({
//         path: "beneficiary",
//         select: "firstName lastName age gender nationality imageUrl",
//       });

//     res.status(200).json({ pendingSessions });
//   } catch (error) {
//     logger.error("Error fetching pending sessions:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // Get Canceled Sessions
// export const getCanceledSessions = async (req, res) => {
//   try {
//     const canceledSessions = await Session.find({ status: "Canceled" })
//       .select("sessionDate beneficiary")
//       .populate({
//         path: "beneficiary",
//         select: "firstName lastName age gender nationality imageUrl",
//       });

//     res.status(200).json({ canceledSessions });
//   } catch (error) {
//     logger.error("Error fetching canceled sessions:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// };

export const updatePendingToScheduled = async (req, res) => {
  try {
    const { sessionId } = req.params; 

    const session = await Session.findOne({ _id: sessionId, status: "Pending" });

    if (!session) {
      return res.status(404).json({ message: "Session not found or not in 'Pending' status." });
    }
    session.status = "Scheduled";
    await session.save();

    // Return the updated session
    res.status(200).json({ message: "Session status updated to 'Scheduled'.", session });
  } catch (error) {
    logger.error("Error updating session status:", error);
    res.status(500).json({ error: "Server error" });
  }
};
// caancel session
export const cancelSession = async (req, res) => {
  try {
    const { id } = req.params; 
    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    if (session.status === 'Canceled') {
      return res.status(400).json({ message: 'Session is already canceled.' });
    }
    if (session.status === 'Completed') {
      return res.status(400).json({ message: 'Session can not canceled.' });
    }
    session.status = 'Canceled';
    await session.save();

    res.status(200).json({
      message: 'Session canceled successfully.',
      session,
    });
  } catch (error) {
    console.error('Error canceling session:', error.message || error);
    res.status(500).json({ message: 'Server error.', error: error.message });
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
