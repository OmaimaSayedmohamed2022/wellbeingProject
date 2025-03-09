import bcrypt from 'bcryptjs';
import Specialist from '../models/specialistModel.js';
import { uploadToCloudinary } from '../middlewares/cloudinaryUpload.js';
import logger from '../config/logger.js';
import jwt from "jsonwebtoken";
import { categories,subcategoryToCategoryMapping  } from '../constants/categories.js';


export const registerSpecialist = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      nationality,
      work,
      workAddress,
      homeAddress,
      bio,
      sessionPrice,
      yearsExperience,
      sessionDuration,
      specialties,
      sessions,
      isAvailable      
    } = req.body;

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Initialize uploaded files
    const uploadedFiles = {};

    if (req.files?.idOrPassport?.[0]) {
      uploadedFiles.idOrPassport = await uploadToCloudinary(req.files.idOrPassport[0]);
    }
    
    if (req.files?.resume?.[0]) {
      uploadedFiles.resume = await uploadToCloudinary(req.files.resume[0]);
    }
    
    if (req.files?.certificates) {
      uploadedFiles.certificates = await Promise.all(req.files.certificates.map(file => uploadToCloudinary(file)));
    }
    
    if (req.files?.ministryLicense?.[0]) {
      uploadedFiles.ministryLicense = await uploadToCloudinary(req.files.ministryLicense[0]);
    }
    
    if (req.files?.associationMembership?.[0]) {
      uploadedFiles.associationMembership = await uploadToCloudinary(req.files.associationMembership[0]);
    }
  
    // Create and save the specialist in the database
    const specialist = new Specialist({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      nationality,
      work,
      workAddress,
      homeAddress,
      bio,
      sessionPrice,
      yearsExperience,
      sessionDuration,
      specialties,
      files: uploadedFiles,
      sessions,
      isConfirmed: false,
      isAvailable       
    });

    await specialist.save();
    const token = jwt.sign(
      { userId: specialist._id, email: specialist.email }, 
      process.env.JWT_SECRET,
      { expiresIn: '1h' } 
    );

    res.status(201).json({
      message: 'Specialist registered successfully.', specialist, token
    });
  } catch (error) {
    console.error('Error registering specialist:', error.message || error);
    res.status(500).json({ message: error.message || 'Internal server error.' });
  }
};




export const getSpecialistsByCategory = async (req, res) => {
  const { category, subcategory } = req.body;

  try {
    if (!category || !subcategory || !Array.isArray(subcategory)) {
      return res.status(400).json({ message: 'Category and subcategory (as an array) are required.' });
    }

    const query = {
      [`specialties.${category}`]: { $in: subcategory }, // Use dynamic field reference
      isConfirmed: true, // Optional: Only confirmed specialists
    };

    const matchingSpecialists = await Specialist.find(query).select("-files"); // Exclude files field

    if (matchingSpecialists.length === 0) {
      return res.status(404).json({ message: 'No specialists found for the selected category and subcategory.' });
    }

    res.status(200).json({
      message: 'Specialists fetched successfully.',
      specialists: matchingSpecialists,
    });
  } catch (error) {
    console.error(`Error fetching specialists: ${error.message}`);
    res.status(500).json({ message: 'Error fetching specialists.', error: error.message });
  }
};


export const updateSpecialist = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = await Specialist.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedData || !id) {
      return res.status(404).json({ message: 'Specialist not found' });
    }

    return res.status(200).json({ message: "Specialist updated successfully", updatedData });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteSpecialist = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Specialist.findByIdAndDelete(id);

    if (!data || !id) {
      return res.status(404).json({ message: 'Specialist not found' });
    }

    return res.status(200).json({
      message: "Specialist deleted successfully",
      data
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const addAvailableSlot = async (req, res) => {
  try {
    const { id } = req.params; 
    const { date } = req.body; 
    if (!date) {
      return res.status(400).json({ message: "Date is required." });
    }

    const slotString = `${date}`;

    const specialist = await Specialist.findById(id);
    if (!specialist) {
      return res.status(404).json({ message: "Specialist not found" });
    }

    if (specialist.availableSlots.includes(slotString)) {
      return res.status(400).json({ message: `Slot ${slotString} is already occupied.` });
    }

    const updatedSpecialist = await Specialist.findByIdAndUpdate(
      id,
      { $push: { availableSlots: slotString } },
      { new: true, runValidators: false } 
    );

    res.status(200).json({
      message: "Added Slot",
      availableSlots: updatedSpecialist.availableSlots,
    });
  } catch (error) {
    res.status(500).json({ message: "Error occurred", error: error.message });
    logger.error({ message: "Error occurred", error: error.message });
  }
};

export const deleteAvailableSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({ message: "Date is required." });
    }

    const slotString = `${date}`;

    const specialist = await Specialist.findById(id);
    if (!specialist) {
      return res.status(404).json({ message: "Specialist not found" });
    }

    if (!specialist.availableSlots.includes(slotString)) {
      return res.status(400).json({ message: `Slot ${slotString} not found.` });
    }

    const updatedSpecialist = await Specialist.findByIdAndUpdate(
      id,
      { $pull: { availableSlots: slotString } },
      { new: true, runValidators: false }
    );

    res.status(200).json({
      message: "Slot removed successfully",
      availableSlots: updatedSpecialist.availableSlots,
    });
  } catch (error) {
    res.status(500).json({ message: "Error occurred", error: error.message });
  }
};

export const countSpecialist = async (req, res) => {
  try {
    const count = await Specialist.countDocuments(); 
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error counting specialists", error: error.message });
  }
};

// All specialties
export const getAllSpecialists = async (req, res) => {
  try {
    const data = await Specialist.find({ isConfirmed: true });

    res.status(200).json({
      message: "Specialists fetched successfully.",
      data
    });
  } catch (error) {
    logger.error(`Error fetching specialists: ${error.message}`);
    res.status(500).json({ message: "Error fetching specialists.", error: error.message });
  }
};

// Specialists [ sorted ]
const getSortedSpecialists = async (sortOrder) => {
  return await Specialist.find({ isConfirmed: true }).sort({ sessions: sortOrder });
};

// Specialists [ descending ]
export const getTopSpecialists = async (req, res) => {
  try {
    const data = await getSortedSpecialists(-1);
    res.status(200).json({ message: 'Top specialists fetched successfully.', data });
  } catch (error) {
    logger.error(`Error fetching top specialists: ${error.message}`);
    res.status(500).json({ message: 'Error fetching top specialists.', error: error.message });
  }
};

// Specialists [ ascending ]
export const getBottomSpecialists = async (req, res) => {
  try {
    const data = await getSortedSpecialists(1);
    res.status(200).json({ message: 'Bottom specialists fetched successfully.', data });
  } catch (error) {
    logger.error(`Error fetching bottom specialists: ${error.message}`);
    res.status(500).json({ message: 'Error fetching bottom specialists.', error: error.message });
  }
};

// Search for specialists
export const searchSpecialists = async (req, res) => {
  try {
    const { name, specialty, status } = req.query;
    let query = {};

    if (name) {
      query.$or = [
        { firstName: { $regex: name, $options: 'i' } },
        { lastName: { $regex: name, $options: 'i' } }
      ];
    }

    if (specialty) {
      query.specialties = { $in: [specialty] };
    }

    if (status) {
      query.isAvailable = status.toLowerCase() === 'available';
    }

    const data = await Specialist.find(query);
    res.status(200).json({ message: 'Search completed successfully.', data });
  } catch (error) {
    logger.error(`Error during search: ${error.message}`);
    res.status(500).json({ message: 'Error during search.', error: error.message });
  }
};

// Confirm Specialist
export const confirmSpecialist = async (req, res) => {
  const { specialistId } = req.params;

  try {
    const specialist = await Specialist.findById(specialistId);

    if (!specialist) {
      return res.status(404).json({ message: "Specialist not found" });
    }

    specialist.isConfirmed = true; 
    await specialist.save();

    res.status(200).json({ message: "Specialist confirmed successfully." });
  } catch (error) {
    logger.error("Error confirming specialist:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update Specialist Availability
export const updateSpecialistAvailability = async (req, res) => {
  try {
    const { specialistId } = req.params;
    const { isAvailable } = req.body; 

    if (typeof isAvailable !== "boolean") {
      return res.status(400).json({ message: "Invalid request. 'isAvailable' must be true or false" });
    }

    const specialist = await Specialist.findByIdAndUpdate(
      specialistId,
      { isAvailable }, 
      { new: true } 
    );

    if (!specialist) {
      return res.status(404).json({ message: "Specialist not found" });
    }

    res.status(200).json({ 
      message: `Specialist availability updated to ${isAvailable ? 'Available' : 'Not Available'}.`,
      specialist
    });
  } catch (error) {
    logger.error("Error updating specialist availability:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Specialists [ Unconfirmed ]
export const getUnconfirmedSpecialists = async (req, res) => {
  try {
    const data = await Specialist.find({ isConfirmed: false });
    res.status(200).json({ message: 'Unconfirmed specialists fetched successfully.', data });
  } catch (error) {
    logger.error(`Error getting unconfirmed specialists: ${error.message}`);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getSpecialistById = async (req, res) => {
  const { id } = req.params;

  try {
    const specialist = await Specialist.findById(id).select('-password');
    if (!specialist) {
      return res.status(404).json({ error: 'Specialist not found.' });
    }
    return res.status(201).json({ message: 'Specialist fetched successfully', specialist });
  } catch (error) {
    logger.error(`Error fetching specialist: ${error.message}`);
    res.status(500).json({ message: "Error fetching specialist", error: error.message });
  }
};

// Get Specialists Attendance Rate 
export const getSpecialistsAttendanceRate = async (req, res) => {
  try {
    const specialists = await Specialist.find({}, 'firstName lastName sessions');
    
    const attendanceData = specialists.map(specialist => {
      const totalSessions = specialist.sessions.length;
      const completedSessions = specialist.sessions.filter(session => session.status === 'completed').length;
      const attendanceRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
      
      return {
        specialistId: specialist._id,
        name: `${specialist.firstName} ${specialist.lastName}`,
        attendanceRate: attendanceRate.toFixed(2) + '%',
      };
    });

    res.status(200).json({ message: 'Attendance rate fetched successfully.', attendanceData });
  } catch (error) {
    logger.error(`Error fetching attendance rate: ${error.message}`);
    res.status(500).json({ message: 'Error fetching attendance rate.', error: error.message });
  }
};

// Get Overall Attendance Rate
export const getAttendanceRate = async (req, res) => {
  try {
    const specialists = await Specialist.find({}, 'sessions');
    
    let totalSessions = 0;
    let completedSessions = 0;
    
    specialists.forEach(specialist => {
      totalSessions += specialist.sessions.length;
      completedSessions += specialist.sessions.filter(session => session.status === 'completed').length;
    });
    
    const overallAttendanceRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
    
    res.status(200).json({ 
      message: 'Overall attendance rate fetched successfully.', 
      overallAttendanceRate: overallAttendanceRate.toFixed(2) + '%' 
    });
  } catch (error) {
    logger.error(`Error fetching overall attendance rate: ${error.message}`);
    res.status(500).json({ message: 'Error fetching attendance rate.', error: error.message });
  }
};

// Get Specialties Comparison
export const getSpecialtiesComparison = async (req, res) => {
  try {
    const specialtiesData = await Specialist.aggregate([
      {
        $project: {
          psychologicalDisordersCount: {
            $size: { $ifNull: ["$specialties.psychologicalDisorders", []] }
          },
          mentalHealthCount: {
            $size: { $ifNull: ["$specialties.mentalHealth", []] }
          },
          physicalHealthCount: {
            $size: { $ifNull: ["$specialties.physicalHealth", []] }
          },
          skillDevelopmentCount: {
            $size: { $ifNull: ["$specialties.skillDevelopment", []] }
          }
        }
      },
      {
        $group: {
          _id: null,
          totalPsychologicalDisorders: { $sum: "$psychologicalDisordersCount" },
          totalMentalHealth: { $sum: "$mentalHealthCount" },
          totalPhysicalHealth: { $sum: "$physicalHealthCount" },
          totalSkillDevelopment: { $sum: "$skillDevelopmentCount" }
        }
      },
      {
        $project: {
          _id: 0,
          total: {
            $add: [
              "$totalPsychologicalDisorders",
              "$totalMentalHealth",
              "$totalPhysicalHealth",
              "$totalSkillDevelopment"
            ]
          },
          totalPsychologicalDisorders: 1,
          totalMentalHealth: 1,
          totalPhysicalHealth: 1,
          totalSkillDevelopment: 1
        }
      },
      {
        $project: {
          psychologicalDisordersPercentage: {
            $round: [
              { $multiply: [{ $divide: ["$totalPsychologicalDisorders", "$total"] }, 100] },
              2
            ]
          },
          mentalHealthPercentage: {
            $round: [
              { $multiply: [{ $divide: ["$totalMentalHealth", "$total"] }, 100] },
              2
            ]
          },
          physicalHealthPercentage: {
            $round: [
              { $multiply: [{ $divide: ["$totalPhysicalHealth", "$total"] }, 100] },
              2
            ]
          },
          skillDevelopmentPercentage: {
            $round: [
              { $multiply: [{ $divide: ["$totalSkillDevelopment", "$total"] }, 100] },
              2
            ]
          }
        }
      }
    ]);

    res.status(200).json({ message: 'Specialties comparison fetched successfully.', specialtiesData });
  } catch (error) {
    logger.error(`Error fetching specialties comparison: ${error.message}`);
    res.status(500).json({ message: 'Error fetching specialties comparison.', error: error.message });
  }
};

export const updateLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    const { language } = req.body;
    const allowedLanguages = ["Arabic", "English"];

    if (!allowedLanguages.includes(language)) {
      return res.status(400).json({ message: "Invalid language. Arabic or English only!" });
    }

    const specialist = await Specialist.findById(id);
    if (!specialist) {
      return res.status(404).json({ message: "Specialist not found." });
    }

    if (specialist.language.includes(language)) {
      return res.status(400).json({ message: "Language already exists." });
    }

    specialist.language.push(language);
    await specialist.save();

    res.status(200).json({ message: "Language added successfully.", languages: specialist.language });
  } catch (error) {
    logger.error(`Error updating language: ${error.message}`);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};