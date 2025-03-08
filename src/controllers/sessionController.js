
import logger from "../config/logger.js";
import Session from "../models/sessionModel.js";
import mongoose from "mongoose";
import { categories,sessionTypes, getAllSubcategories } from '../constants/categories.js'; 
// import Specialist from "../models/specialistModel.js";
// import { Beneficiary } from "../models/beneficiaryModel.js"
import { Notification } from "../models/notificationModel.js";


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
  const { description, sessionType, category, subcategory, beneficiary, sessionDate, specialist } = req.body;

  try {
    const sessionTypes = ['Instant Session', 'Free Session', 'Regular Session', 'Group Therapy'];

    if (!sessionTypes.includes(sessionType)) {
      return res.status(400).json({ error: "Invalid session type." });
    }

    // ✅ Validate category and subcategory
    if (!categories.includes(category)) {
      return res.status(400).json({ error: "Invalid category." });
    }

    const validSubcategories = getAllSubcategories(category);
    if (!validSubcategories.includes(subcategory)) {
      return res.status(400).json({ error: "Invalid subcategory for the selected category." });
    }

    let sessionDateObj = sessionDate ? new Date(sessionDate) : null;

    // ✅ Group Therapy Logic (No Time, No Date, No Specialist)
    if (sessionType === "Group Therapy") {
      let existingSession = await Session.findOne({ sessionType: "Group Therapy", category, subcategory });

      if (existingSession) {
        if (existingSession.beneficiary.includes(beneficiary)) {
          return res.status(400).json({ error: "User is already in this group." });
        }
        if (existingSession.beneficiary.length >= 3) {
          return res.status(400).json({ error: "Group is full." });
        }

        existingSession.beneficiary.push(beneficiary);
        await existingSession.save();

        // 🔔 Notify when the group reaches 3 members
        if (existingSession.beneficiary.length === 3) {
          const notification = new Notification({
            userId: existingSession.beneficiary, 
            message: `Group therapy session is now ready.`,
          });
          await notification.save();

          const io = getIo();
          io.emit("newNotification", {
            userId: existingSession.beneficiary,
            message: `Group therapy session is now ready.`,
          });
        }

        return res.status(200).json({ message: "User added to existing group therapy session.", session: existingSession });
      } else {
        // Create a new group session
        const newSession = new Session({
          sessionType,
          category,
          subcategory,
          description,
          beneficiary: [beneficiary], // First user joins
        });

        await newSession.save();
        return res.status(201).json({ message: "New group therapy session created.", session: newSession });
      }
    }

    // ✅ Instant Session (No Specialist Required)
    if (sessionType === "Instant Session" || sessionType === "جلسة فورية") {
      let session = new Session({
        sessionType,
        category,
        subcategory,
        description,
        beneficiary,
        sessionDate: sessionDateObj || new Date(), // Default to now if not provided
        specialist: specialist || null, // Optional
      });

      await session.save();
      return res.status(201).json({ message: "Instant session created successfully.", session });
    }

    // ✅ Regular Session (Requires Date & Specialist)
    if (sessionType === "Regular Session") {
      if (!sessionDate || !specialist) {
        return res.status(400).json({ error: "Regular sessions require a date and specialist." });
      }

      const conflictingSession = await Session.findOne({ sessionDate: sessionDateObj, specialist });
      if (conflictingSession) return res.status(400).json({ error: "A session already exists at the requested time." });

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
      return res.status(201).json({ message: "Regular session created successfully.", session: newSession });
    }

  } catch (error) {
    console.error("❌ Error creating session:", error);
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
