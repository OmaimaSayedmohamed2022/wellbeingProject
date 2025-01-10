import Specialist from '../models/specialistModel.js';
import bcrypt from 'bcryptjs';

// Controller to register a specialist
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
    } = req.body;


    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Check if the email already exists
    

    // Create a new specialist
    const specialist = new Specialist({
      firstName,
      lastName,
      email,
      password:hashedPassword, 
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
    });

    // Save the specialist to the database
    await specialist.save();

    res.status(201).json({
      message: 'Specialist registered successfully',
    });
  } catch (error) {
    console.error('Error registering specialist:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};