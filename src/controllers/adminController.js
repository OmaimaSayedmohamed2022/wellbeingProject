import { Admin } from '../models/adminModel.js'
import bcrypt from 'bcryptjs';


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
