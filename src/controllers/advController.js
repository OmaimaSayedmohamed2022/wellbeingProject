import Adv from'../models/advModel.js'
export const addAdvertisement =async (req, res) => {
    try{
    const {title ,photo,type}=req.body
    if(!title||!photo||!type){
        res.status(400).json({
            message :"All fields are required"})
    }
    const adv =await Adv.create(req.body)
    res.status(201).json({
     message :"A new Advertisment is added successfully" ,
     adv
    })
    }
    catch (error) {
        console.error('Error adding Advertisment :', error.message || error);
        res.status(500).json({ message: error.message || 'Internal server error.' });
      }
}
