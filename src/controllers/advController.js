import Adv from '../models/advModel.js';


export const addAdvertisement = async (req, res) => {
    try {
      const { title, type } = req.body;
      if (!title || !type || !req.body.imageUrl) {
        return res.status(400).json({ message: 'All fields are required.' });
      }
  
      // Create the advertisement with the Cloudinary image URL
      const adv = await Adv.create({ title, photo: req.body.imageUrl, type });
  
      res.status(201).json({
        message: 'A new advertisement is added successfully.',
        adv,
      });
    } catch (error) {
      console.error('Error adding advertisement:', error.message || error);
      res.status(500).json({ message: error.message || 'Internal server error.' });
    }
  };


  export const getAllAdv= async(req,res)=>{
    try{
    const advs=  await  Adv.find()
    res.status(201).json({
      message: ' advertisements',
      advs,
    });
  } catch (error) {
    console.error('Error getting advertisements:', error.message || error);
    res.status(500).json({ message: error.message || 'Internal server error.' });
  }

  }