import express from 'express'
import {registerAdmin} from '../controllers/adminController.js'
import   {countSpecialist}from '../controllers/specialistController.js'

const router=express.Router()

router.post('/register',registerAdmin)
router.post('/countSpecialist',countSpecialist)



export default router