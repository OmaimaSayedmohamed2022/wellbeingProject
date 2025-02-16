import { countBeneficiary, countGender, getUsersAtMonth } from "../controllers/adminController.js";


const router = express.Router();


router.get('/beneficiary/count', countBeneficiary)
router.get('/beneficiary/countGender',countGender)
router.get('/beneficiary/byMonth',getUsersAtMonth)
router.get('/specialist/count',countSpecialist)
export default router