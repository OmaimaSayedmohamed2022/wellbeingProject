import express from 'express';
import { getCategories, getSubcategories,getsubSubcategories } from '../controllers/categoriesController.js';

const router = express.Router();

// Route to fetch main categories
router.get('/', getCategories);

// Route to fetch subcategories for a specific category
router.get('/:category', getSubcategories);
router.get('/subcategory/:name', getsubSubcategories);

export default router;
