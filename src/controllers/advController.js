import Adv from '../models/advModel.js';
import { uploadToCloudinary } from '../middlewares/cloudinaryUpload.js'; 
import logger from "../config/logger.js";

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
    const { id } = req.params;
    const { title, type } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (type) updateData.type = type;
    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file); // Upload to Cloudinary
      updateData.photo = imageUrl; 
    }
    // update the advertisement 
    const updatedAdv = await Adv.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    // check if the advertisement exists
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

// add view to advertisement
export const addViewToAd = async (req, res) => {
  try {
      const { id } = req.params; 
      const ad = await Adv.findById(id);
      
      if (!ad) {
          return res.status(404).json({ message: "Ad not found." });
      }

      ad.views += 1; 
      await ad.save();

      res.status(200).json({ message: "View added successfully.", views: ad.views });
  } catch (error) {
      logger.error("Error adding view:", error);
      res.status(500).json({ message: "Server error", error: error.message });
  }
};

// get advertisement interactions
export const getAdInteractions = async (req, res) => {
  try {
      const interactions = await Adv.aggregate([
          { $group: { _id: "$type", totalViews: { $sum: "$views" } } }
      ]);

      res.status(200).json({ interactions });
  } catch (error) {
      logger.error("Error fetching ad interaction statistics:", error);
      res.status(500).json({ message: "Server error", error: error.message });
  }
};

// get advertisement views per day all time
export const getAdEngagementRate = async (req, res) => {
  try {
      const engagement = await Adv.aggregate([
          { 
              $group: { 
                  _id: { $dayOfMonth: "$createdAt" }, 
                  totalViews: { $sum: "$views" } 
              } 
          },
          { $sort: { _id: 1 } }
      ]);

      res.status(200).json({ engagement });
  } catch (error) {
      logger.error("Error fetching ad engagement rate:", error);
      res.status(500).json({ message: "Server error", error: error.message });
  }
};

// get advertisement views per day for the last 7 days
export const getAdViewsPerDay = async (req, res) => {
  try {
      const dailyStats = await Adv.aggregate([
          { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }, 
          { $group: { _id: { $dayOfMonth: "$createdAt" }, totalViews: { $sum: "$views" } } },
          { $sort: { "_id": 1 } }
      ]);

      res.status(200).json({ dailyStats });
  } catch (error) {
      logger.error("Error fetching ad views statistics:", error);
      res.status(500).json({ message: "Server error", error: error.message });
  }
};
