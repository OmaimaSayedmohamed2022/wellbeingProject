import {Beneficiary} from '../models/beneficiaryModel.js';
import Specialist from '../models/specialistModel.js';
import  bcrypt from "bcryptjs"
import logger from '../config/logger.js';
import mongoose from 'mongoose';
import { uploadToCloudinary } from '../middlewares/cloudinaryUpload.js';
import { uploadFiles } from '../middlewares/uploadFiles.js';
import { Admin } from '../models/adminModel.js';
import Session from '../models/sessionModel.js';
import jwt from 'jsonwebtoken'

// Create a new Beneficiary
export const createBeneficiary = async (req, res) => {
  const { firstName, lastName, email, password, phone, profession, homeAddress, age, region, nationality, gender, sessions } = req.body;

  try {
    const existingBeneficiary = await Beneficiary.findOne({ email });
    if (existingBeneficiary) {
      logger.warn(`Registration failed - Email already exists: ${email}`);
      return res.status(400).json({ error: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newBeneficiary = new Beneficiary({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      profession,
      homeAddress,
      age,
      region,
      nationality,
      gender,
      sessions,
    });

    await newBeneficiary.save();
    logger.info(`New Beneficiary registered: ${email}`);

    const token = jwt.sign(
      { userId: newBeneficiary._id, email: newBeneficiary.email }, 
      process.env.JWT_SECRET,
      { expiresIn: '1h' } 
    );
    res.status(201).json({ message: 'Beneficiary created successfully',newBeneficiary ,token});
  } catch (error) {
   
    res.status(500).json({ error: 'Server error' });
  }
};

// get benificary profile by id
export const getBeneficiaryById = async (req, res) => {
  const id = req.params.id

  if (!mongoose.Types.ObjectId.isValid(id)) {
    logger.warn(`Invalid Beneficiary ID: ${id}`);
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  try {
    const beneficiary = await Beneficiary.findById(id, { password: 0,createdAt:0,__v:0 }).populate({
      path: "sessions",  
      select: "sessionDate status", 
    });
    if (!beneficiary) {
      logger.warn(`Beneficiary not found for ID: ${id}`);
      return res.status(404).json({ error: 'Beneficiary not found' });
    }

    const scheduledSessions = beneficiary.sessions.filter(session => session.status === "Scheduled");
    const completedSessions = beneficiary.sessions.filter(session => session.status === "Completed");

    logger.info(`Beneficiary profile retrieved for ID: ${id}`);
    res.status(200).json({
      firstName: beneficiary.firstName,
      lastName: beneficiary.lastName,
      age: beneficiary.age,
      gender: beneficiary.gender,
      nationality: beneficiary.nationality,
      profession: beneficiary.profession,
      imageUrl: beneficiary.imageUrl, 
      scheduledSessions,
      completedSessions
    });
  } catch (error) {
    logger.error('Error in getBeneficiaryById:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


// update beneficary profile 
export const updateBeneficiary= async(req,res)=>{
  try {
   
    const id =req.params.id  ;
    const beneficiary = await Beneficiary.findByIdAndUpdate(id, req.body, {
      new: true, 
      runValidators: true,
    })
    if(!beneficiary|| !id){
      return res.status(404).json({
        message:"beneficiary is not found"
      })
    } 

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10); // Generate salt
      req.body.password = await bcrypt.hash(req.body.password, salt); // Hash the password
    }
    // Update beneficiary
    const updatedBeneficiary = await Beneficiary.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      message: 'Beneficiary updated successfully.',
      updatedBeneficiary,
    });
  } catch(error){
    console.error('Error updating beneficiary:', error.message || error);
    res.status(500).json({ message: error.message || 'Internal server error.' });
  }
}

// delet beneficary
export const deleteBeneficiary=async(req,res)=>{
  try{
    const id=req.params.id
    const x =await Beneficiary.findById(id)
    if(!x){
      return res.status(404).json({
        message:"beneficiary is not found to delete"
      })
    }
    const data =await Beneficiary.findByIdAndDelete(id)
    return res.status(200).json({
      message: "Beneficiary deleted successfully",
      data
    });

  }
  catch(error){
    console.error('Error updating beneficiary:', error.message || error);
    res.status(500).json({ message: error.message || 'Internal server error.' });
  }
}


// add image to beneficary profile 
export const addImageToUser = async (req, res) => {
  try {
    const id = req.params.id;
    
    uploadFiles(req, res, async (err) => {
      if (err) {
        console.error("Error uploading files:", err.message);
        return res.status(400).json({ message: err.message });
      }

      // Check if the user exists in Beneficiaries or Specialists
      let user = await Beneficiary.findById(id);
      let userType = "Beneficiary";

      if (!user) {
        user = await Specialist.findById(id);
        userType = "Specialist";
      }
      if (!user) {
        user = await Admin.findById(id);
        userType = "Admin";
      }

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      // Upload image to Cloudinary if provided
      if (req.files?.Image?.[0]) {
        const uploadedImageUrl = await uploadToCloudinary(req.files.Image[0]);
        req.body.imageUrl = uploadedImageUrl;
      }

      // Update user (either Beneficiary or Specialist)
      const updatedUser =
  userType === "Beneficiary"
    ? await Beneficiary.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
    : userType === "Specialist"
    ? await Specialist.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
    : await Admin.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

      res.status(200).json({
        message: `Image added successfully to ${userType}.`,
        updatedUser,
      });
    });
  } catch (error) {
    console.error("Error adding image to user:", error.message || error);
    res.status(500).json({ message: error.message || "Internal server error." });
  }
};


export const getAllBeneficary = async (req, res) => {
  try {
    // Count total beneficiaries
    const totalBeneficiaries = await Beneficiary.countDocuments();

    // Fetch beneficiaries with sessions and specialists
    const beneficiaries = await Beneficiary.find()
      .populate({
        path: "sessions",
        populate: {
          path: "specialist",
          select: "firstName lastName email phone workAddress",
        },
      });
console.log("Beneficiaries before population:", beneficiaries);


    res.status(200).json({
      message: "Beneficiaries fetched successfully",
      totalBeneficiaries, // ✅ Total count included
      beneficiaries,
    });
  } catch (error) {
    console.error("Error getting beneficiaries:", error.message || error);
    res.status(500).json({ message: error.message || "Internal server error." });
  }
};


export const getBeneficiarySessions = async (req, res) => {
  try {
      const id = req.params.id;
      if (!id) {
          return res.status(400).json({ message: "ID is required" });
      }

      const beneficiary = await Beneficiary.findById(id).populate("sessions");
      if (!beneficiary) {
          return res.status(404).json({ message: "Beneficiary not found" });
      }

      const sessions = beneficiary.sessions || [];
      const totalSessions = sessions.length;
      const scheduledSessions = sessions.filter(s => s.status === "Scheduled");
      const completedSessions = sessions.filter(s => s.status === "Completed");
      const canceledSessions = sessions.filter(s => s.status === "Canceled");

      // Get upcoming sessions (future dates)
      const currentDate = new Date();
      const upcomingSessions = scheduledSessions.filter(s => new Date(s.sessionDate) > currentDate);

      res.status(200).json({
          totalSessions,
          scheduledSessions,
          completedSessions,
          canceledSessions,
          upcomingSessions
      });

  } catch (error) {
      res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};



export const requestSessionDateUpdate = async (req, res) => {
  try {
    const { beneficiaryId, sessionId } = req.params;
    const { newSessionDate } = req.body;

    if (!newSessionDate) {
      return res.status(400).json({ message: "New session date is required." });
    }

    const beneficiary = await Beneficiary.findById(beneficiaryId).populate({
      path: "sessions",
      populate: { path: "specialist" },
    });
    if (!beneficiary) {
      return res.status(404).json({ message: "Beneficiary not found." });
    }

    const session = beneficiary.sessions.find(s => s._id.toString() === sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found for this beneficiary." });
    }

    const specialist = session.specialist;
    if (!specialist.availableSlots.includes(newSessionDate)) {
      return res.status(400).json({ message: "Requested date is not available in specialist's slots." });
    }

    session.requestedDate = new Date(newSessionDate);
    session.status = "Requested";
    await session.save();

    res.status(200).json({ message: "Session update requested. Awaiting specialist approval.", session });
  } catch (error) {
    console.error("Error requesting session date update:", error.message || error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const confirmSessionUpdate = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId).populate("specialist");
    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }

    if (!session.requestedDate) {
      return res.status(400).json({ message: "No requested date change found." });
    }

    session.sessionDate = session.requestedDate;
    session.status = "Scheduled"; 
    session.requestedDate = null; 
    await session.save();

    res.status(200).json({ message: "Session update confirmed and scheduled.", session });
  } catch (error) {
    console.error("Error confirming session update:", error.message || error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};