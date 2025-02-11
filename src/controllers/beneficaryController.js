import {Beneficiary} from '../models/beneficiaryModel.js';
import  bcrypt from "bcryptjs"
import logger from '../config/logger.js';
import mongoose from 'mongoose';
import { uploadToCloudinary } from '../middlewares/cloudinaryUpload.js';
import { uploadFiles } from '../middlewares/uploadFiles.js';

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
    res.status(201).json({ message: 'Beneficiary created successfully',newBeneficiary});
  } catch (error) {
    logger.error('Error in createBeneficiary:', error);
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
export const addImageBeneficiary = async (req, res) => {
  try {
    const id = req.params.id;
    uploadFiles(req, res, async (err) => {
      if (err) {
        console.error('Error uploading files:', err.message);
        return res.status(400).json({ message: err.message });
      }
      const beneficiary = await Beneficiary.findById(id);
      if (!beneficiary) {
        return res.status(404).json({ message: 'Beneficiary not found.' });
      }
      // Check and upload image to Cloudinary
      if (req.files?.Image?.[0]) {
        const uploadedImageUrl = await uploadToCloudinary(req.files.Image[0]);
        req.body.imageUrl = uploadedImageUrl; 
      }
      // update beneficiary
      const updatedBeneficiary = await Beneficiary.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });

      res.status(200).json({
        message: 'image added successfully.',
        updatedBeneficiary,
      });
    });
  } catch (error) {
    console.error('Error adding image beneficiary:', error.message || error);
    res.status(500).json({ message: error.message || 'Internal server error.' });
  }
};