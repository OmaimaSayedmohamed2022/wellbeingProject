import express from 'express';
import { getCategories, getSubcategories,getsubSubcategories ,getSessionTypes} from '../controllers/categoriesController.js';

const router = express.Router();

// Route to fetch main categories
router.get('/', getCategories);
// Route to fetch subcategories for a specific category
router.get('/:category/:lang', getSubcategories);
router.get('/subcategory/:name/:lang', getsubSubcategories);

export default router;
