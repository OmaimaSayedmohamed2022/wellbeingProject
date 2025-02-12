import { addAdvertisement, 
        //  deleteAdvertisement,
        //  getAllAdvertisements, 
        //  updateAdvertisement 
       }
from '../controllers/advController.js';
import express from 'express';
import upload from '../middlewares/uploadMiddleware.js';
import uploadImageMiddleware from '../middlewares/uploadImageMiddleware.js';
import{ verifyToken,authorizeRole} from '../middlewares/authMiddleware.js'
const router = express.Router();

// Error here :

router.post('/add',
    verifyToken, authorizeRole(['admin']),
     upload.single('photo'),
      uploadImageMiddleware, 
      addAdvertisement);

// router.get(
//   '/getAll' , getAllAdvertisements
// )

// router.put('/update/:id',updateAdvertisement)

// router.delete('/delete/:id',deleteAdvertisement)

export default router;