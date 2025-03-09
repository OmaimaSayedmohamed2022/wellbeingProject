
import logger from "../config/logger.js";
import Session from "../models/sessionModel.js";
import mongoose from "mongoose";
import { categories,sessionTypes, getAllSubcategories } from '../constants/categories.js'; 
import Specialist from "../models/specialistModel.js";
import { Beneficiary } from "../models/beneficiaryModel.js"
import moment from "moment";



export const getSessionTypes= async (req, res) => {

  try {
      res.status(200).json({ sessionTypes });
      
  } catch (error) {
      console.error("Error fetching session types:", error);
      res.status(500).json({ error: "Internal server error" });
  }
}

// create session
export const createSession = async (req, res) => {
  const {
    description,
    sessionDate,
    sessionType,
    category,
    subcategory,
    beneficiary,
  } = req.body;

  try {
    // Function to normalize date format (remove milliseconds)
    const normalizeDate = (dateString) => {
      const parsedDate = new Date(dateString);
      return isNaN(parsedDate) ? null : parsedDate.toISOString().split('.')[0] + "Z";
    };

    // Convert sessionDate to ISO format
    const parsedSessionDate = normalizeDate(sessionDate);
    if (!parsedSessionDate) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    let sessionDateObj = moment.utc(parsedSessionDate).toDate();

  
    if (!sessionTypes.includes(sessionType)) {
      return res.status(400).json({ error: "Invalid session type." });
    }

    let specialistId = null;

    // Handle instant sessions
    if (sessionType === 'Instant Session' || sessionType === 'جلسة فورية') {
      // Find an available specialist for the requested time slot
      const availableSpecialist = await Specialist.findOne({
        availableSlots: { $in: [parsedSessionDate] }, // Use $in to match the date
        isAvailable: true,
      });

      console.log("Available Specialist:", availableSpecialist); // Debugging log

      if (availableSpecialist) {
        specialistId = availableSpecialist._id;

        // Remove the booked slot from the specialist's available slots
        availableSpecialist.availableSlots = availableSpecialist.availableSlots.filter(
          (slot) => normalizeDate(slot) !== parsedSessionDate
        );

        // Save the updated specialist
        await availableSpecialist.save();

        console.log("Updated Specialist:", availableSpecialist); // Debugging log
      }
    } else if (sessionType === 'Regular Session') {
      // For regular sessions, require a specialist ID
      const { specialist } = req.body;
      if (!specialist) {
        return res.status(400).json({ error: "Specialist ID is required for regular sessions." });
      }
      specialistId = specialist;
    }

    // Check for conflicting sessions
    const conflictingSession = await Session.findOne({
      sessionDate: parsedSessionDate,
      specialist: specialistId,
    });

    if (conflictingSession) {
      return res.status(400).json({ error: "A session already exists at the requested time." });
    }

    // Create a new session
    const newSession = new Session({
      sessionDate: sessionDateObj,
      sessionType,
      category,
      subcategory,
      description,
      beneficiary,
      specialist: specialistId, // Set to specialist ID or null
    });

    await newSession.save();

    console.log("Session created successfully:", newSession);

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
export const getSessionById = async (req, res) => {
  const { id } = req.params;

  // Validate the ID
  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid session ID" });
  }

  try {
    const session = await Session.findById(id).populate("beneficiary");

    // Handle case where session is not found
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Return the session data
    res.status(200).json({ message: "Session fetched successfully", session });
  } catch (error) {
    logger.error("Error in getSessionById:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getSessionsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ["Scheduled", "Completed", "Pending", "Canceled","Requested"];

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

// // Get Pending Session
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

    const scheduledSessions = await Session.find({
      status: "Scheduled",
      specialist: specialistId,
    }).select("sessionDate").populate("beneficiary");

    const completedSessions = await Session.find({
      status: "Completed",
      specialist: specialistId,
    }).select("sessionDate").populate("beneficiary");


    res.status(200).json({ instantSessions, freeConsultations,scheduledSessions,completedSessions });
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


export const getAllSpecialistSessions = async (req, res) => {
  try {
    // Fetch all instant sessions
    const instantSessions = await Session.find({
      sessionType: "جلسة فورية"||"Instant Session",
    }).populate("beneficiary specialist");

    // Fetch all free consultations
    const freeConsultations = await Session.find({
      sessionType: "جلسة مجانية"|| "Free Session",
    }).populate("beneficiary specialist");

    // Return the results
    res.status(200).json({ instantSessions, freeConsultations });
  } catch (error) {
    logger.error("Error in getAllSpecialistSessions:", error);
    res.status(500).json({ error: "Server error" });
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
// group therapy 

import { sendNotification } from "../middlewares/notificationMiddleware.js";
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const checkSpecialistAvailability = async (specialistId, sessionDate) => {
  const existingSession = await Session.findOne({ specialist: specialistId, sessionDate });
  return !existingSession; // Returns true if the specialist is available
};

 // ✅ Import Socket Notification

export const joinGroupTherapy = async (req, res) => {
  try {
    const { description, sessionDate, category, subcategory, beneficiary, specialist } = req.body;

    console.log("📥 Group Therapy API Request Received:", req.body);

    // ✅ Validate Beneficiary ID
    if (!mongoose.Types.ObjectId.isValid(beneficiary)) {
      console.log("❌ Invalid Beneficiary ID:", beneficiary);
      return res.status(400).json({ error: "Invalid Beneficiary ID" });
    }

    // ✅ Validate Specialist ID
    if (specialist && !mongoose.Types.ObjectId.isValid(specialist)) {
      console.log("❌ Invalid Specialist ID:", specialist);
      return res.status(400).json({ error: "Invalid Specialist ID" });
    }

    // ✅ Find an existing session with available space
    let existingSession = await Session.findOne({
      sessionType: "Group Therapy",
      category,
      subcategory,
      $expr: { $lt: [{ $size: "$beneficiary" }, 3] }, // ✅ Ensure group has space
    });

    if (existingSession) {
      if (existingSession.beneficiary.includes(beneficiary)) {
        console.log("❌ User already in group.");
        return res.status(400).json({ error: "User is already in this group." });
      }

      existingSession.beneficiary.push(new mongoose.Types.ObjectId(beneficiary));
      console.log(`✅ Added beneficiary ${beneficiary} to existing session.`);

      // ✅ If the group is full, assign a specialist
      if (existingSession.beneficiary.length === 3) {
        console.log("🎯 Group is now full! Assigning specialist...");

        let assignedSpecialist = specialist
          ? await Specialist.findById(specialist)
          : await Specialist.findOne({ role: "specialist" });

        if (!assignedSpecialist) {
          console.log("❌ No available specialist found.");
          return res.status(400).json({ error: "No available specialist found." });
        }

        existingSession.specialist = assignedSpecialist._id;
        console.log(`✅ Assigned Specialist: ${assignedSpecialist._id}`);

        // ✅ Send notifications
        let notificationMessage = "Your group therapy session is now ready!";
        existingSession.beneficiary.forEach(async (userId) => {
          await sendNotification(userId, notificationMessage);
        });
        await sendNotification(
          assignedSpecialist._id,
          "You have been assigned to a new group therapy session."
        );

        console.log("📩 Real-time notifications sent to all participants and specialist.");
      }

      await existingSession.save();
      return res.status(200).json({
        message: "User added to group therapy session.",
        session: existingSession,
      });
    }

    // ✅ If NO session exists, create a NEW session
    console.log("🆕 No available session found. Creating a new group therapy session...");

    // **Check specialist availability before assigning**
    if (specialist) {
      const isSpecialistAvailable = await checkSpecialistAvailability(specialist, sessionDate);
      if (!isSpecialistAvailable) {
        console.log("❌ Specialist is not available at the requested time.");
        return res.status(400).json({ error: "Specialist is not available at the requested time." });
      }
    }

    let newSession = new Session({
      description,
      sessionDate,
      sessionType: "Group Therapy",
      category,
      subcategory,
      specialist: specialist ? new mongoose.Types.ObjectId(specialist) : null,
      beneficiary: [new mongoose.Types.ObjectId(beneficiary)],
    });

    await newSession.save();
    console.log("✅ New group therapy session created.");

    return res.status(201).json({
      message: "New group therapy session created.",
      session: newSession,
    });
  } catch (error) {
    console.error("❌ Error in Group Therapy API:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


// 
export const getAllGroupTherapySessions = async (req, res) => {
  try {
    console.log("📥 Fetching all group therapy sessions...");

    // Find all sessions where sessionType is "Group Therapy"
    const groupTherapySessions = await Session.find({ sessionType: "Group Therapy" })
      .populate("beneficiary") 
      .populate("specialist")  
      .sort({ sessionDate: 1 }); 

    if (groupTherapySessions.length === 0) {
      console.log("⚠️ No group therapy sessions found.");
      return res.status(404).json({ message: "No group therapy sessions found." });
    }

    console.log(`✅ Found ${groupTherapySessions.length} group therapy sessions.`);
    return res.status(200).json({ sessions: groupTherapySessions });

  } catch (error) {
    console.error("❌ Error fetching group therapy sessions:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// specalist group  therapy
export const getGroupTherapyForSpecialist = async (req, res) => {
  try {
    const { specialistId } = req.params;
    
    console.log(`📥 Fetching group therapy sessions for specialist: ${specialistId}`);

    // Validate specialist ID
    if (!mongoose.Types.ObjectId.isValid(specialistId)) {
      console.log("❌ Invalid Specialist ID:", specialistId);
      return res.status(400).json({ error: "Invalid Specialist ID" });
    }

    // Find group therapy sessions assigned to the given specialist
    const sessions = await Session.find({ 
      sessionType: "Group Therapy", 
      specialist: specialistId 
    })
      .populate("beneficiary", "name email") // Populate beneficiary details
      .populate("specialist", "name email")  // Populate specialist details
      .sort({ sessionDate: 1 }); // Sort by date (oldest to newest)

    if (sessions.length === 0) {
      console.log("⚠️ No group therapy sessions found for this specialist.");
      return res.status(404).json({ message: "No group therapy sessions found for this specialist." });
    }

    console.log(`✅ Found ${sessions.length} group therapy sessions for specialist.`);
    return res.status(200).json({ sessions });

  } catch (error) {
    console.error("❌ Error fetching group therapy sessions for specialist:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
