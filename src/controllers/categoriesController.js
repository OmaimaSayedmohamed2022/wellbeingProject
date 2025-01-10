import {categories} from '../constants/categories.js';

// Controller to fetch main categories
export const getCategories = (req, res) => {
  res.status(200).send(Object.keys(categories));
};

// Controller to fetch subcategories for a specific category
export const getSubcategories = (req, res) => {
  const { category } = req.params;
  if (!categories[category]) {
    return res.status(404).send({ error: 'Category not found' });
  }
  res.status(200).send(categories[category]);
};
