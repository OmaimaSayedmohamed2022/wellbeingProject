import  mongoose from 'mongoose';


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
  imageUrl:{ 
    type: String, 
    required: false 
  },
  dateOfJoining: { type: Date, default: Date.now },
});

export const Admin = mongoose.model('Admin', adminSchema);
