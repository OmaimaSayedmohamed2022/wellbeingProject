import {Beneficiary} from '../models/beneficiaryModel.js';
import  bcrypt from "bcryptjs"
import logger from '../config/logger.js';
import mongoose from 'mongoose';

// Create a new Beneficiary
export const createBeneficiary = async (req, res) => {
  const { firstName, lastName, email, password, phone, profession, homeAddress, age, region, nationality, gender } = req.body;

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
    });

    await newBeneficiary.save();
    logger.info(`New Beneficiary registered: ${email}`);
    res.status(201).json({ message: 'Beneficiary created successfully'});
  } catch (error) {
    logger.error('Error in createBeneficiary:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getBeneficiaryById = async (req, res) => {
  const { id } = req.params;

  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    logger.warn(`Invalid Beneficiary ID: ${id}`);
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  try {
    const beneficiary = await Beneficiary.findById(id, { password: 0,createdAt:0,__v:0 ,_id:0,role:0});
    if (!beneficiary) {
      logger.warn(`Beneficiary not found for ID: ${id}`);
      return res.status(404).json({ error: 'Beneficiary not found' });
    }

    logger.info(`Beneficiary profile retrieved for ID: ${id}`);
    res.status(200).json(beneficiary);
  } catch (error) {
    logger.error('Error in getBeneficiaryById:', error);
    res.status(500).json({ error: 'Server error' });
  }
};



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
    res.status(200).json({
     updatedBeneficiary: beneficiary
    })
  } catch(error){
    console.error('Error updating beneficiary:', error.message || error);
    res.status(500).json({ message: error.message || 'Internal server error.' });
  }
}


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

