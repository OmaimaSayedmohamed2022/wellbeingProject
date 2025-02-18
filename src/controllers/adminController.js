// import Admin from'../models/adminModel.js';
import Adv from '../models/advModel.js';
import { Beneficiary } from '../models/beneficiaryModel.js';
import Session from '../models/sessionModel.js';
import Specialist from '../models/specialistModel.js';

// exports.registerAdmin = async (req, res) => {
//   const { username, email, password } = req.body;

//   try {
//     const existingAdmin = await Admin.findOne({ email });
//     if (existingAdmin) {
//       return res.status(400).json({ message: 'Admin already exists' });
//     }

//     const admin = new Admin({ username, email, password });
//     await admin.save();

//     const token = admin.generateToken();
//     res.status(201).json({ message: 'Admin registered successfully', token });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };



// beneficiary

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
