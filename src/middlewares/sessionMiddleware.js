import moment from 'moment';
import { categories, sessionTypes } from '../constants/categories.js'


export const sessionMiddleware = (req, res, next) => {
  const {description, sessionDate, sessionType, category, subcategory } = req.body;

  // Validate sessionDate format
  if (!moment(sessionDate, moment.ISO_8601, true).isValid()) {
    return res.status(400).send({ error: 'Invalid date format' });
  }

  // Ensure the sessionDate is in the future
  if (moment(sessionDate).isBefore(moment())) {
    return res.status(400).send({ error: 'Cannot schedule in the past' });
  }

  // Validate session type
  if (!sessionTypes.includes(sessionType)) {
    return res.status(400).send({ error: 'Invalid session type' });
  }

  // Validate category
  if (!Object.keys(categories).includes(category)) {
    return res.status(400).send({ error: 'Invalid category' });
  }

  // Validate subcategory for the given category
  const categoryData = categories[category];
  let validSubcategories = [];

  if (Array.isArray(categoryData)) {
    validSubcategories = categoryData.flatMap(item =>
      typeof item === 'object' && item.subcategory ? item.subcategory : item
    );
  }

  if (subcategory && !validSubcategories.includes(subcategory)) {
    return res.status(400).send({ error: `Invalid subcategory for ${category}` });
  }

  next();
};
