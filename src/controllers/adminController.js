import Admin from'../models/adminModel.js';

exports.registerAdmin = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const admin = new Admin({ username, email, password });
    await admin.save();

    const token = admin.generateToken();
    res.status(201).json({ message: 'Admin registered successfully', token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
