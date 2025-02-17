import { addAdvertisement, deleteAdvertisement, getAllAdvertisements, updateAdvertisement } from '../controllers/advController.js';
import express from 'express'
const router = express.Router();

// Error here :

router.post(
  '/add' , addAdvertisement
)

router.get(
  '/getAll' , getAllAdvertisements
)

router.put('/update/:id',updateAdvertisement)

router.delete('/delete/:id',deleteAdvertisement)
export default router;