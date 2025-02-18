// import Specialist from "../models/specialistModel.js";
// import { Beneficiary } from "../models/beneficiaryModel.js";
// import Session from "../models/sessionModel.js";
// import logger from "../config/logger.js";

// // get Beneficiary Count For Specialist
// export const getBeneficiaryCountForSpecialist = async (req, res) => {
//   try {
//     const { specialistId } = req.params;

//     const beneficiaryList = await Session.distinct("beneficiary", {
//       specialist: specialistId,
//     });

//     const beneficiaryCount = beneficiaryList.length;

//     res.status(200).json({
//       message: "Beneficiary count fetched successfully.",
//       beneficiaryCount,
//     });
//   } catch (error) {
//     logger.error(Error `fetching beneficiary count: ${error.message}`);
//     res.status(500).json({ message: "Server error", error: error.message });
//  }
// };

// // Get Specialist Earnings
// export const getSpecialistEarnings = async (req, res) => {
//   try {
//     const { specialistId } = req.params;

//     const specialist = await Specialist.findById(specialistId);
//     if (!specialist) {
//       return res.status(404).json({ message: "Specialist not found." });
//     }

//     const completedSessions = await Session.find({
//       specialist: specialistId,
//       status: "Completed",
//     });

//     const totalEarnings = completedSessions.length * specialist.sessionPrice;

//     res.status(200).json({
//       message: "Earnings fetched successfully.",
//       earnings: totalEarnings,
//     });
//   } catch (error) {
//     logger.error(`Error fetching earnings: ${error.message}`);
//     res
//       .status(500)
//       .json({ message: "Error fetching earnings.", error: error.message });
//   }
// };

// // Get Available Slots for Specialist
// export const getAvailableSlotsForSpecialist = async (req, res) => {
//   try {
//     const { specialistId } = req.params;

//     const specialist = await Specialist.findById(specialistId).select(
//       "availableSlots"
//     );

//     if (!specialist) {
//       return res.status(404).json({ message: "Specialist not found." });
//     }

//     res.status(200).json({
//       message: "Available slots fetched successfully.",
//       availableSlots: specialist.availableSlots,
//     });
//   } catch (error) {
//     logger.error(`Error fetching available slots: ${error.message}`);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// // Get Sessions Ratio
// export const getSessionStatusRatio = async (req, res) => {
//   try {
//     const { specialistId } = req.params;

//     const totalSessions = await Session.countDocuments({
//       specialist: specialistId,
//     });

//     if (totalSessions === 0) {
//       return res.status(200).json({
//         message: "No sessions found for this specialist.",
//         completedRatio: 0,
//         canceledRatio: 0,
//       });
//     }

//     const completedSessions = await Session.countDocuments({
//       specialist: specialistId,
//       status: "Completed",
//     });

//     const canceledSessions = await Session.countDocuments({
//       specialist: specialistId,
//       status: "Cancelled",
//     });

//     const completedRatio = ((completedSessions / totalSessions) * 100).toFixed(
//       2
//     );
//     const canceledRatio = ((canceledSessions / totalSessions) * 100).toFixed(2);

//     res.status(200).json({
//       message: "Session status ratios fetched successfully.",
//       completedRatio: `${completedRatio}%`,
//       canceledRatio: `${canceledRatio}%`,
//     });
//   } catch (error) {
//     logger.error(`Error fetching session status ratios: ${error.message}`);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// // Get Scheduled Sessions For Specialist
// export const getScheduledSessionsForSpecialist = async (req, res) => {
//   try {
//     const { specialistId } = req.params;

//     const specialist = await Specialist.findById(specialistId);
//     if (!specialist) {
//       return res.status(404).json({ message: "Specialist not found." });
//     }

//     const scheduledSessions = await Session.find({
//       specialist: specialistId,
//       status: "Scheduled",
//     })
//       .populate("beneficiary", "name")
//       .select("beneficiary sessionDate");

//     res.status(200).json({
//       message: "Scheduled sessions fetched successfully.",
//       scheduledSessions,
//     });
//   } catch (error) {
//     logger.error(`Error fetching scheduled sessions: ${error.message}`);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// // Get Beneficiary Reviews
// export const getBeneficiaryReviews = async (req, res) => {
//   try {
//     const { beneficiaryId } = req.params;

//     const beneficiary = await Beneficiary.findById(beneficiaryId).select(
//       "name reviews"
//     );

//     if (!beneficiary) {
//       return res.status(404).json({ message: "Beneficiary not found." });
//     }

//     res.status(200).json({
//       message: "Reviews fetched successfully.",
//       beneficiaryName: beneficiary.name,
//       reviews: beneficiary.reviews,
//     });
//   } catch (error) {
//     logger.error(`Error fetching reviews: ${error.message}`);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };


// export const getSessionsCount = async (req, res) => {
//   try {
//     // Get current date in UTC
//     const now = new Date();
//     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); // First day of the month
//     const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999); // Last day of the month

//     // console.log("Filtering sessions from:", startOfMonth, "to:", endOfMonth);

//     // Query sessions where sessionDate falls in this month
//     const sessions = await Session.find({
//       sessionDate: { $gte: startOfMonth, $lte: endOfMonth }
//     });

//     // console.log("Fetched sessions:", sessions.length);

//     // Count total, paid, and free sessions
//     const totalSessions = sessions.length;
//     const paidSessions = sessions.filter(session => session.paymentStatus === "Paid").length;
//     const freeSessions = totalSessions - paidSessions;

//     // Calculate percentages
//     const paidPercentage = totalSessions ? ((paidSessions / totalSessions) * 100).toFixed(2) + "%" : "0%";
//     const freePercentage = totalSessions ? ((freeSessions / totalSessions) * 100).toFixed(2) + "%" : "0%";

//     res.status(200).json({
//       message: "Sessions count fetched successfully.",
//       totalSessions,
//       paidSessions,
//       freeSessions,
//       paidPercentage,
//       freePercentage,
//     });
//   } catch (error) {
//     console.error("Error fetching session counts:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };