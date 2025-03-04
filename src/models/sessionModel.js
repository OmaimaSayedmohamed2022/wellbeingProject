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
      enum:['Instant Session','Free Session' ,"Regular Session"],
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
      enum: ['Scheduled', 'Completed', 'Canceled',"Requested", 'Pending'], 
      default: 'Pending',
    },
    beneficiary:{
      type: mongoose.Schema.Types.ObjectId,
      ref:'Beneficiary',
      required:true

    },
    specialist:{
      type: mongoose.Schema.Types.ObjectId,
      ref:'Specialist'
    },
  paymentStatus: { type: String, enum: ['Unpaid', 'Pending', 'Paid'], default: 'Unpaid' },
  paymentDetails: {
    transactionId: String,
    amount: Number,
    method: String, // Visa, MasterCard, Audi Bank
  },
  sessionDate: { type: Date, required: true },
  requestedDate: { type: Date }, 
  createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } 
);

const Session = mongoose.model('Session', sessionSchema);

export default Session;
