import logger from '../config/logger.js';
import Session from '../models/sessionModel.js';

// Mocked session types
const sessionTypes = ['جلسة فورية', 'جلسة مجانية'];

// Controller to fetch session types
export const getSessionTypes = (req, res) => {
  res.json(sessionTypes);
};

// Controller to submit session details
export const submitSession = async(req, res) => {
const { category, subcategory, sessionType, description } = req.body;
  try{
  const newSession  =new Session({
    category,
     subcategory,
      sessionType, 
      description
  });
  await newSession.save();

  res.status(200).send('new session created successfuly')
  logger.info(`New session created: ${newSession._id}`);
  }
  catch(error){ 
   logger.error(`Error creating session: ${error.message}`);
   res.status(500).send({message:'error in created sessiom',error:error.message })
}
}
