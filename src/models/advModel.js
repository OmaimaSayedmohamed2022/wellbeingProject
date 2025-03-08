import mongoose from 'mongoose';

const advSchema= new mongoose.Schema({
    title:{
        type:String ,
        required:true
    },
    photo:{
       type:String
    } ,
    type:{
        type:String ,
        required:true,
        enum: ["عروض", "تنبيهات", "ترويج"]
    },
    views: {
      type: Number,
      default: 0, 
    },
    createdAt: {
        type: Date,
        default: Date.now,
      },
    },
    { timestamps: true } 
  );

const Adv = mongoose.model('Adv', advSchema);

export default Adv;