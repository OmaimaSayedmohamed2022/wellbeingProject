import {categories} from '../constants/categories.js';

import { sessionTypes } from '../constants/categories.js';
import { TEXT_CONSTANTS } from '../constants/privacyPolicy.js';

export const getSessionTypes = (req, res) => {
  const { lang } = req.params;

  if (!sessionTypes[lang]) {
    return res.status(400).json({ error: 'Unsupported language ' });
  }

  // Return the session types for the requested language
  res.status(200).json(sessionTypes[lang]);
};

export const getCategories = (req, res) => {
  const mainCategories = Object.keys(categories).map((key) => ({
    en: key,
  }));
  res.status(200).send(mainCategories);
};

// Controller to fetch subcategories for a specific category
export const getSubcategories = (req, res) => {
  const { category, lang } = req.params;
  if (!categories[category]) {
    return res.status(404).send({ error: 'Category not found ' });
  }

  const subcategories = categories[category][lang].map((item) => {
    if (typeof item === 'object' && item.name) {
      return {
        name: item.name,
        subcategory: item.subcategory,
      };
    } else {
      return {
        name: item,
      };
    }
  });

  res.status(200).send(subcategories);
};

// get sub sub category


export const getsubSubcategories = (req, res) => {
  const { name, lang } = req.params;
  const category = Object.values(categories)
    .flatMap((category) => category[lang])
    .find((item) => {
      if (typeof item === 'object' && item.name) {
        return item.name === name;
      } else {
        return item === name;
      }
    });

  if (!category) {
    return res.status(404).send({ error: 'Subcategory not found'});
  }

  // Return sub-subcategories if they exist
  if (category.subcategory) {
    return res.status(200).send(category.subcategory);
  }

  res.status(200).send(category);
};


//privacy and policy 
export const privacyAndPolicy =async (req, res) => {
    const lang = req.params.lang.toUpperCase(); 
    const response = {};

    Object.keys(TEXT_CONSTANTS).forEach((key) => {
        response[key] = TEXT_CONSTANTS[key][lang] || TEXT_CONSTANTS[key]["AR"];
    });

    res.json(response);
}