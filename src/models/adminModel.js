import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Admin schema - can include additional fields unique to admin users
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: {
    type: String,
    enum: ['admin'], 
    required: true,
    default: 'admin' 
  },
  dateOfJoining: { type: Date, default: Date.now },
});

// Hash the password before saving the admin
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  // Hash password using bcrypt
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to check if passwords match
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate JWT
adminSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Export the Admin model as a module
export default mongoose.model('Admin', adminSchema);

