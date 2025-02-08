import { addAdvertisement, deleteAdvertisement, getAllAdvertisements, updateAdvertisement } from '../controllers/advController.js';

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