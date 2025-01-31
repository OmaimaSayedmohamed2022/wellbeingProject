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
  const categoryNames = categories[category].map(item => 
    typeof item === 'object' ? item.name : item
  );
  res.status(200).send(categoryNames);
};



export const getsubSubcategories = (req, res) => {
  const { name } = req.params;
  if (!name) {
    return res.status(400).json({ error: "Name parameter is required" });
  }
  // console.log('categories',categories)
  const category= Object.values(categories).flat().find(
    (item) =>  typeof item === 'object'? item.name === name :item ===name
  
  );
  if (!category) {
    return res.status(404).send({ error: 'Category not found' });
  }
  res.status(200).send(category);
};

