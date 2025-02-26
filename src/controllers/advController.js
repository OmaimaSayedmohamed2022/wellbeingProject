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

  };
  // Get adv by id
export const getAdvertisementById = async (req, res) => {
  try {
    const { id } = req.params; 
    const adv = await Adv.findById(id);
    if (!adv) {
      return res.status(404).json({ message: 'Advertisement not found.' });
    }

    res.status(200).json({
      message: 'Advertisement retrieved successfully.',
      adv,
    });
  } catch (error) {
    console.error('Error retrieving advertisement:', error.message || error);
    res.status(500).json({ message: error.message || 'Internal server error.' });
  }
};


export const updateAdvertisement = async (req, res) => {
  try {
    const { id } = req.params; // Advertisement ID
    const { title, type ,photo} = req.body; // Extract fields from form data

    console.log('Request Params:', req.params); // Log the ID
    console.log('Request Body:', req.body); // Log the form data

    // Create an update object with only the provided fields
    const updateData = {};
    if (title) updateData.title = title;
    if (type) updateData.type = type;

    // If a file is uploaded, add it to the update data
    if (req.file) {
      updateData.photo = req.file.path; // Assuming the file path is stored in req.file.path
    }

    // Update the advertisement and return the updated document
    const updatedAdv = await Adv.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    // Check if the advertisement exists
    if (!updatedAdv) {
      return res.status(404).json({ message: 'Advertisement not found.' });
    }

    res.status(200).json({
      message: 'Advertisement updated successfully.',
      adv: updatedAdv,
    });
  } catch (error) {
    console.error('Error updating advertisement:', error.message || error);
    res.status(500).json({ message: error.message || 'Internal server error.' });
  }
};

  export const deleteAdvertisement = async (req, res) => {
    try {
      const { id } = req.params; 

      const adv = await Adv.findById(id);
      if (!adv) {
        return res.status(404).json({ message: 'Advertisement not found.' });
      }
  
      // Delete the adv
      await Adv.findByIdAndDelete(id);
  
      res.status(200).json({
        message: 'Advertisement deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting advertisement:', error.message || error);
      res.status(500).json({ message: error.message || 'Internal server error.' });
    }
  };

