import bcrypt from 'bcryptjs';
import Specialist from '../models/specialistModel.js';
import { uploadToCloudinary } from '../middlewares/cloudinaryUpload.js';


const uploadFileFields = async (files) => {
  const fileTypes = ["idOrPassport", "resume", "certificates", "ministryLicense", "associationMembership"];
  const uploadedFiles = {};

  await Promise.all(
    fileTypes.map(async (type) => {
      if (files?.[type]) {
        uploadedFiles[type] = Array.isArray(files[type])
          ? await Promise.all(files[type].map(file => uploadToCloudinary(file)))
          : await uploadToCloudinary(files[type][0]);
      }
    })
  );
};
// Controller: Register Specialist
export const registerSpecialist = async (req, res) => {
  try {
    const {
      firstName, lastName, email, password, phone, nationality, work,
      workAddress, homeAddress, bio, sessionPrice, yearsExperience,
      sessionDuration, specialties
    } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Upload files to Cloudinary
    const uploadedFiles = await uploadFileFields(req.files);

    //save specialist
    const specialist = new Specialist({
      firstName, lastName, email, password: hashedPassword, phone,
      nationality, work, workAddress, homeAddress, bio, sessionPrice,
      yearsExperience, sessionDuration, specialties, files: uploadedFiles
    });

    await specialist.save();

    res.status(201).json({ message: 'Specialist registered successfully.', specialist });
  } catch (error) {
    console.error('Error registering specialist:', error);
    res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};
// get specialist by his category
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
 
  const{ id }=req.params;
  try{
    const specialist = await Specialist.findById(id)
    if (!specialist) {
      return res.status(400).json({ error: 'Specialist not found.' })
    }
      return res.status(200).json({message:'specialist gitting successfully',specialist})

  }catch(error){
    res.status(500).json({message:"error gitting specialist", error:error.message})
  }
};


export const getAllSpecialists= async(req,res)=>{
try{
 const specialists = await Specialist.find()
 if(!specialists){
  res.status(400).json("no specialist found")
 }
 return res.status(201).json({message:'specialists gitting successfully',specialists})
}catch(error){
  res.status(500).json({message:"error gitting specialists", error:error.message})
  }

}

export const updateSpecialist = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = await Specialist.findByIdAndUpdate(id,req.body,{ new: true });

    if (!updatedData ||!id) {
      return res.status(404).json({ message: 'Specialist not found' });
    }

    return res.status(200).json({message:"specilist updated sucessfully ",updatedData});
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteSpecialist = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Specialist.findByIdAndDelete(id)

    if (!data ||!id) {
      return res.status(404).json({ message: 'Specialist not found' });
    }

    return res.status(200).json({
      message:" specialist deleted successfully " ,
      data});
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const addAvailableSlot = async (req, res) => {
  try {
    const { id } = req.params; 
    const { date } = req.body; 
    if (!date) {
      return res.status(400).json({ message: "Date are required." });
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
)
    res.status(200).json({
      message: "Added Slot ",
      availableSlots: updatedSpecialist.availableSlots,
    });
  } catch (error) {
    res.status(500).json({ message: "Error occured", error: error.message });
  }
};


export const deleteAvailableSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time } = req.body;

    if (!date || !time) {
      return res.status(400).json({ message: "Date and time are required." });
    }

    const slotString = `${date} ${time}`;

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

