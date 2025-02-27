import { addAdvertisement, 
         deleteAdvertisement,
         getAllAdv,
         updateAdvertisement ,
         getAdvertisementById

       }
from '../controllers/advController.js';
import express from 'express';
import upload from '../middlewares/uploadMiddleware.js';
import uploadImageMiddleware from '../middlewares/uploadImageMiddleware.js';
import{ verifyToken,authorizeRole} from '../middlewares/authMiddleware.js'
const router = express.Router();


router.post('/add',
    verifyToken, authorizeRole(['admin']),
     upload.single('photo'),
      uploadImageMiddleware, 
      addAdvertisement);

router.get(
  '/getAll' , getAllAdv
)
router.get(
    '/get/:id' , getAdvertisementById
  )
  
router.put('/update/:id',verifyToken, 
          authorizeRole(['admin']),
          upload.single('photo'),
          uploadImageMiddleware, 
          updateAdvertisement)

router.delete('/delete/:id',deleteAdvertisement)

export default router;
