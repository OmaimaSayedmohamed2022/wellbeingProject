import { Admin } from '../models/adminModel.js'
import bcrypt from 'bcryptjs';
import { Beneficiary}  from '../models/beneficiaryModel.js';
import Session from '../models/sessionModel.js';
import Adv from "../models/advModel.js"
import Specialist from "../models/specialistModel.js";
import logger from "../config/logger.js";



export const registerAdmin = async (req, res) => {
  const { username, email, password } = req.body

  try {
     const existingAdmin = await Admin.findOne({ email });
     if (existingAdmin) {
       return res.status(400).json({ message: 'Admin already exists' });
    }
    const salt = await bcrypt.genSalt(10); // Generate salt
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = new Admin({ 
      username,
      email,
      password :hashedPassword 
     });
    await admin.save();
    
    res.status(201).json({ message: 'Admin registered successfully', token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


export const getAdminById = async (req, res) => {
  const { id } = req.params;

  try {
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.status(200).json({ message: 'Admin retrieved successfully', admin });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


export const countBeneficiary = async (req, res) => {
  try {
    const count = await Beneficiary.countDocuments(); 
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error counting specialists", error: error.message });
  }
};


export const countGender = async (req, res) => {
  try {
    const total = await Beneficiary.countDocuments(); 
    if (total === 0) {
      return res.status(200).json({ message: "No beneficiaries found", male: 0, female: 0, malePercentage: 0, femalePercentage: 0 });
    }

    const maleCount = await Beneficiary.countDocuments({ gender: { $in: ["Male", "male"] } });
    const femaleCount = await Beneficiary.countDocuments({ gender: { $in: ["Female", "female"] } });

    const malePercentage = ((maleCount / total) * 100).toFixed(2); 
    const femalePercentage = ((femaleCount / total) * 100).toFixed(2) 

    res.status(200).json({
      total,
      male: maleCount,
      female: femaleCount,
      malePercentage: `${malePercentage}%`,
      femalePercentage: `${femalePercentage}%`
    });
    res.status(200).json({
      male: maleCount,
      female: femaleCount
    });
  } catch (error) {
    res.status(500).json({ message: "Error counting genders", error: error.message });
  }
};


export const getUsersAtMonth = async (req, res) => {
  try {
    const usersPerMonth = await Beneficiary.aggregate([
      {
        $group: {
          _id: { 
            year: { $year: "$createdAt" }, 
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.status(200).json(usersPerMonth);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong!" });
  }
};


// Specialist
export const countSpecialist = async (req, res) => {
  try {
    const count = await Specialist.countDocuments(); 
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error counting specialists", error: error.message });
  }
};


// sessions :
// comfirmed and cancelled 

export const getSessionStatistics = async (req,res) => {
  try {
    const totalSessions = await Session.countDocuments();
    if (totalSessions === 0) {
      return res.status(200).json({ confirmedPercentage: '0%', cancelledPercentage: '0%' });
    }

    const confirmedCount = await Session.countDocuments({ status: 'Completed' });
    const cancelledCount = await Session.countDocuments({ status: 'Cancelled' });

    const confirmedPercentage = ((confirmedCount / totalSessions) * 100).toFixed(2) + '%';
    const cancelledPercentage = ((cancelledCount / totalSessions) * 100).toFixed(2) + '%';

    res.status(200).json({
      confirmedPercentage,
      cancelledPercentage,
    });
  } catch (error) {
    console.error('Error fetching session statistics:', error);
    res.status(500).json({ error: 'Failed to fetch session statistics' });
  }
};



export const getAllUpcomingSessions = async (req, res) => {
  try {
    const sessions = await Session.find()
      .select('sessionDate status category subcategory sessionType description paymentStatus beneficiary')
      .populate('beneficiary', 'name email') // جلب معلومات المستفيد
      .sort({ sessionDate: 1 });

    if (!sessions.length) {
      return res.status(404).json({ message: 'No sessions found' });
    }

    // تصنيف الجلسات حسب الحالة
    const scheduledSessions = sessions.filter(session => session.status === 'Scheduled');
    const pendingSessions = sessions.filter(session => session.paymentStatus === 'Pending');
    const cancelledSessions = sessions.filter(session => session.status === 'Cancelled');

    res.status(200).json({
      scheduledSessions,
      pendingSessions,
      cancelledSessions,
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
};

// completed sessions
export const countCompletedSessions =async(req,res)=>{

  try {
    const result = await Session.aggregate([
      {
        $match: { status: 'Completed' }  
      },
      {
        $group: {
          _id: { year: { $year: "$sessionDate" }, month: { $month: "$sessionDate" } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 } 
      }
    ]);

    res.status(200).json(result);
  } catch (error) {
    console.error('internal server error:', error);
    res.status(500).json({ message: 'internal server error' });
  }
}



export const countAdv= async(req,res)=>{
  try {
    const result = await Adv.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' }, // استخراج الشهر من تاريخ إنشاء الإعلان
          count: { $sum: 1 } // عدّ عدد الإعلانات لكل شهر
        }
      },
      { $sort: { _id: 1 } } // ترتيب حسب الأشهر
    ]);

    // حساب النسبة المئوية لكل شهر بناءً على إجمالي الإعلانات
    const totalAds = result.reduce((sum, month) => sum + month.count, 0);
    
    const formattedResult = result.map(month => ({
      month: month._id,
      count: month.count,
      rate: totalAds ? ((month.count / totalAds) * 100).toFixed(2) + "%" : "0%" // نسبة عدد الإعلانات لهذا الشهر من إجمالي الإعلانات
    }));

    res.status(200).json(formattedResult);
  } catch (error) {
    console.error('Error', error);
    res.status(500).json({ message: ' Internatl server error' });
  }
}


export const calPayments = async (req, res) => {
  try {
    const result = await Session.aggregate([
      {
        $match: {
          paymentStatus: 'Paid',
          'paymentDetails.amount': { $gt: 0 },
          sessionDate: { $exists: true, $ne: null } 
        }
      },
      {
        $group: {
          _id: { $month: '$sessionDate' }, 
          totalEarnings: { $sum: '$paymentDetails.amount' } 
        }
      },
      { $sort: { _id: 1 } }
    ]);

   
    const formattedResult = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      earnings: result.find(r => r._id === i + 1)?.totalEarnings || 0
    }));

    res.status(200).json(formattedResult);
  } catch (error) {
    console.error('internal server error :', error);
    res.status(500).json({ message: 'internal server error' });
  }
};

export const getSessiosBeneficiary = async (req, res) => {
  try {
      const id = req.params.id;
      if (!id){
        return res.status(404).json({ message: "id not found" });
      }
      const beneficiary = await Beneficiary.findById(id).populate("sessions");

      if (!beneficiary) {
          return res.status(404).json({ message: "Beneficiary not found" });
      }

      const totalSessions = beneficiary.sessions.length;
      const completededSessions = beneficiary.sessions.filter(s => s.status === "Completed").length;
      const canceledSessions = beneficiary.sessions.filter(s => s.status === "Canceled").length;

      res.status(200).json({
          totalSessions,
          completededSessions,
          canceledSessions
      });
  } catch (error) {
      res.status(500).json({ message: "Internal Server Error", error:error.message });
  }
};
export const getUpcomingSessions = async (req, res) => {
  try {
      const id = req.params.id;
      const beneficiary = await Beneficiary.findById(id).populate({
          path: "sessions",
          match: { status: "Scheduled" },
          select: "sessionDate specialist"
      });

      if (!beneficiary) {
          return res.status(404).json({ message: "Beneficiary not found" });
      }

      res.status(200).json({ upcomingSessions: beneficiary.sessions });
  } catch (error) {
      res.status(500).json({ message: "Internal Server Error", error });
  }
};


// get Beneficiary Count For Specialist
export const getBeneficiaryCountForSpecialist = async (req, res) => {
  try {
    const { specialistId } = req.params;

    const beneficiaryList = await Session.distinct("beneficiary", {
      specialist: specialistId,
    });

    const beneficiaryCount = beneficiaryList.length;

    res.status(200).json({
      message: "Beneficiary count fetched successfully.",
      beneficiaryCount,
    });
  } catch (error) {
    logger.error(Error `fetching beneficiary count: ${error.message}`);
    res.status(500).json({ message: "Server error", error: error.message });
 }
};

// Get Specialist Earnings
export const getSpecialistEarnings = async (req, res) => {
  try {
    const { specialistId } = req.params;

    const specialist = await Specialist.findById(specialistId);
    if (!specialist) {
      return res.status(404).json({ message: "Specialist not found." });
    }

    const completedSessions = await Session.find({
      specialist: specialistId,
      status: "Completed",
    });

    const totalEarnings = completedSessions.length * specialist.sessionPrice;

    res.status(200).json({
      message: "Earnings fetched successfully.",
      earnings: totalEarnings,
    });
  } catch (error) {
    logger.error(`Error fetching earnings: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error fetching earnings.", error: error.message });
  }
};

// Get Available Slots for Specialist
export const getAvailableSlotsForSpecialist = async (req, res) => {
  try {
    const { specialistId } = req.params;

    const specialist = await Specialist.findById(specialistId).select(
      "availableSlots"
    );

    if (!specialist) {
      return res.status(404).json({ message: "Specialist not found." });
    }

    res.status(200).json({
      message: "Available slots fetched successfully.",
      availableSlots: specialist.availableSlots,
    });
  } catch (error) {
    logger.error(`Error fetching available slots: ${error.message}`);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Sessions Ratio
export const getSessionStatusRatio = async (req, res) => {
  try {
    const { specialistId } = req.params;

    const totalSessions = await Session.countDocuments({
      specialist: specialistId,
    });

    if (totalSessions === 0) {
      return res.status(200).json({
        message: "No sessions found for this specialist.",
        completedRatio: 0,
        canceledRatio: 0,
      });
    }

    const completedSessions = await Session.countDocuments({
      specialist: specialistId,
      status: "Completed",
    });

    const canceledSessions = await Session.countDocuments({
      specialist: specialistId,
      status: "Cancelled",
    });

    const completedRatio = ((completedSessions / totalSessions) * 100).toFixed(
      2
    );
    const canceledRatio = ((canceledSessions / totalSessions) * 100).toFixed(2);

    res.status(200).json({
      message: "Session status ratios fetched successfully.",
      completedRatio: `${completedRatio}%`,
      canceledRatio: `${canceledRatio}%`,
    });
  } catch (error) {
    logger.error(`Error fetching session status ratios: ${error.message}`);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Scheduled Sessions For Specialist
export const getScheduledSessionsForSpecialist = async (req, res) => {
  try {
    const { specialistId } = req.params;

    const specialist = await Specialist.findById(specialistId);
    if (!specialist) {
      return res.status(404).json({ message: "Specialist not found." });
    }

    const scheduledSessions = await Session.find({
      specialist: specialistId,
      status: "Scheduled",
    })
      .populate("beneficiary", "name")
      .select("beneficiary sessionDate");

    res.status(200).json({
      message: "Scheduled sessions fetched successfully.",
      scheduledSessions,
    });
  } catch (error) {
    logger.error(`Error fetching scheduled sessions: ${error.message}`);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Beneficiary Reviews
export const getBeneficiaryReviews = async (req, res) => {
  try {
    const { beneficiaryId } = req.params;

    const beneficiary = await Beneficiary.findById(beneficiaryId).select(
      "name reviews"
    );

    if (!beneficiary) {
      return res.status(404).json({ message: "Beneficiary not found." });
    }

    res.status(200).json({
      message: "Reviews fetched successfully.",
      beneficiaryName: beneficiary.name,
      reviews: beneficiary.reviews,
    });
  } catch (error) {
    logger.error(`Error fetching reviews: ${error.message}`);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getSessionsCount = async (req, res) => {
  try {
    // Get current date in UTC
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); // First day of the month
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999); // Last day of the month

    // console.log("Filtering sessions from:", startOfMonth, "to:", endOfMonth);

    // Query sessions where sessionDate falls in this month
    const sessions = await Session.find({
      sessionDate: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // console.log("Fetched sessions:", sessions.length);

    // Count total, paid, and free sessions
    const totalSessions = sessions.length;
    const paidSessions = sessions.filter(session => session.paymentStatus === "Paid").length;
    const freeSessions = totalSessions - paidSessions;

    // Calculate percentages
    const paidPercentage = totalSessions ? ((paidSessions / totalSessions) * 100).toFixed(2) + "%" : "0%";
    const freePercentage = totalSessions ? ((freeSessions / totalSessions) * 100).toFixed(2) + "%" : "0%";

    res.status(200).json({
      message: "Sessions count fetched successfully.",
      totalSessions,
      paidSessions,
      freeSessions,
      paidPercentage,
      freePercentage,
    });
  } catch (error) {
    console.error("Error fetching session counts:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// all beneficaries
export const getAllBeneficiary = async (req, res) => {
  try {
    const beneficiaries = await Beneficiary.find().select("-password");
    // console.log("Beneficiaries:", beneficiaries);

    res.status(200).json({ message: "Beneficiaries fetched successfully", beneficiaries });
  } catch (error) {
    console.error('Error getting beneficiaries:', error.message || error);

    // Send an error response
    res.status(500).json({ message: error.message || 'Internal server error.' });
  }
};

// get new beneficary 
export const getNewBeneficiaries = async (req, res) => {
  try {
    const { days = 30 } = req.query; 
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const newBeneficiaries = await Beneficiary.find({
      createdAt: { $gte: dateThreshold }, 
    }).sort({ createdAt: -1 }); 

    res.status(200).json({
      message: `New beneficiaries from the last ${days} days fetched successfully.`,
      beneficiaries: newBeneficiaries,
    });
  } catch (error) {
    console.error('Error fetching new beneficiaries:', error.message || error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};