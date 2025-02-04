import bcrypt from 'bcryptjs';
import Specialist from '../models/specialistModel.js';
import { uploadToCloudinary } from '../middlewares/cloudinaryUpload.js';

// Controller: Register Specialist
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
      specialties
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
      files:uploadedFiles,
    });

    await specialist.save();

    res.status(201).json({
      message: 'Specialist registered successfully.',specialist});
  } catch (error) {
    console.error('Error registering specialist:', error.message || error);
    res.status(500).json({ message: error.message || 'Internal server error.' });
  }
};


export const getSpecialistsByCategory = async (req, res) => {
  const { category, subcategory } = req.body;

  try {
    if (!category || !subcategory) {
      return res.status(400).json({ message: 'Category and subcategory are required.' });
    }

    const categoryField = `specialties.${category[0]}`; 

    const matchingSpecialists = await Specialist.find({
      [categoryField]: { $in: subcategory }}, 
      '-files'
    );

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


export const getSpecialistById = async(req,res)=>{
 
  const{id}=req.params;

  try{
   
    const specialist = await Specialist.findById(id)
    if (!specialist) {
      return res.status(404).json({ error: 'Specialist not found.' })
    }
      return res.status(201).json({message:'specialist gitting successfully',specialist})

  }catch(error){
    res.status(500).json({message:"error gitting specialist", error:error.message})
  }
};

export const getAllSpecialists= async(req,res)=>{
try{
 const specialists = await Specialist.find()
 return res.status(201).json({message:'specialists gitting successfully',specialists})
}catch(error){
  res.status(500).json({message:"error gitting specialists", error:error.message})
  }

}
