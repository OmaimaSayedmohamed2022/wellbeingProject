import mongoose, { trusted } from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ['mentalHealth', 'physicalHealth', 'skillsDevelopment'], 
    },
    subcategory: {
      type: String,
      required: function() {
        return ['mentalHealth'].includes(this.category);
      
    }
  },
    sessionType: {
      type: String,
      required: true,
      enum: ['جلسة فورية', 'جلسة مجانية'],
    },
    description: {
      type: String,
      required: true,
      maxlength: 300,
    },
    sessionDate:{
      type:Date,
      required:true
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
    beneficiary:{
      type: mongoose.Schema.Types.ObjectId,
      ref:'Beneficiary',
      required:true

    },
  paymentStatus: { type: String, enum: ['Unpaid', 'Pending', 'Paid'], default: 'Unpaid' },
  paymentDetails: {
    transactionId: String,
    amount: Number,
    method: String, // Visa, MasterCard, Audi Bank
  },

  
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } 
);

const Session = mongoose.model('Session', sessionSchema);

export default Session;
