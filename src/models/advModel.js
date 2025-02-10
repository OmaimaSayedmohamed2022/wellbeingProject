import mongoose from 'mongoose';

const advSchema= new mongoose.Schema({
    title:{
        type:String , required:true
    } , 
    photo:{
       type:String 
    } ,
    type:{
        type:String , required:true
    }
})


const Adv = mongoose.model('Adv', advSchema);

export default Adv;

