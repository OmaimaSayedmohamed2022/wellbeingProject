import mongoose from 'mongoose';

const BeneficiarySchema = new mongoose.Schema({
    
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  profession: { type: String },
  homeAddress: { type: String, required: true },
  age: { type: Number, required: true },
  region: { type: String, required: true },
  nationality: { type: String, required: true },
  gender: { type: String, required: true },
  role: { type: String, enum: ['benificary','specialist' ,'admin'], default: 'benificary' },
  imageUrl:{ type: String, required: false },
  createdAt: { type: Date, default: Date.now },


});

export const Beneficiary =  mongoose.model('Beneficiary', BeneficiarySchema);
