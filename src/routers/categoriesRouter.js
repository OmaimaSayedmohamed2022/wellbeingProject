import express from 'express';
import { getCategories, getSubcategories,getsubSubcategories ,getSessionTypes,privacyAndPolicy } from '../controllers/categoriesController.js';
import {TEXT_CONSTANTS } from '../constants/privacyPolicy.js'

const router = express.Router();

router.get("/privacyPolicy/:lang",privacyAndPolicy  )
 
// Route to fetch main categories
router.get('/', getCategories);
// Route to fetch subcategories for a specific category
router.get('/:category/:lang', getSubcategories);
router.get('/subcategory/:name/:lang', getsubSubcategories);

export default router;
