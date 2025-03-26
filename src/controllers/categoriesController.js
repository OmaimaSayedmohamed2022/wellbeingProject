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
export const privacyAndPolicy = async (req, res) => {
  try {
      const lang = req.params.lang ? req.params.lang.toUpperCase() : "AR"; // اللغة الافتراضية
      const isRTL = lang === "AR"; // تحديد اتجاه النص

      // استخراج المحتوى بناءً على اللغة
      const generalInstructions = TEXT_CONSTANTS.GENERAL_INSTRUCTIONS?.[lang] || "N/A";
      const specialistRecommendations = TEXT_CONSTANTS.SPECIALIST_RECOMMENDATIONS?.[lang] || "N/A";
      const sessionBooking = TEXT_CONSTANTS.SESSION_BOOKING?.[lang] || "N/A";
      const onlineConsultation = TEXT_CONSTANTS.ONLINE_CONSULTATION?.[lang] || "N/A";
      const sessionCost = TEXT_CONSTANTS.SESSION_COST?.[lang] || "N/A";
      const handlingPersonalInfo = TEXT_CONSTANTS.HANDLING_PERSONAL_INFO?.[lang] || "N/A";
      const commonQuestions = TEXT_CONSTANTS.COMMON_QUESTIONS?.[lang] || "N/A";

      const htmlContent = `
          <!DOCTYPE html>
          <html lang="${lang}">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta name="description" content="Privacy Policy for Wellbeing Day">
              <title>${lang === "AR" ? "سياسة الخصوصية" : "Privacy Policy"}</title>
              <style>
                  body { font-family: Arial, sans-serif; margin: 40px; ${isRTL ? "direction: rtl; text-align: right;" : ""} }
                  h1 { color: #333; }
                  p { line-height: 1.6; }
                  section { margin-bottom: 20px; }
                  hr { border: 0; height: 1px; background: #ccc; margin: 20px 0; }
              </style>
          </head>
          <body>
              <h1>${lang === "AR" ? "سياسة الخصوصية" : "Privacy Policy"}</h1>

              <section>
                  <h2>${lang === "AR" ? "التعليمات العامة" : "General Instructions"}</h2>
                  <p>${generalInstructions}</p>
              </section>
              <hr>

              <section>
                  <h2>${lang === "AR" ? "توصيات الأخصائيين" : "Specialist Recommendations"}</h2>
                  <p>${specialistRecommendations}</p>
              </section>
              <hr>

              <section>
                  <h2>${lang === "AR" ? "حجز الجلسات" : "Session Booking"}</h2>
                  <p>${sessionBooking}</p>
              </section>
              <hr>

              <section>
                  <h2>${lang === "AR" ? "الاستشارات عبر الإنترنت" : "Online Consultation"}</h2>
                  <p>${onlineConsultation}</p>
              </section>
              <hr>

              <section>
                  <h2>${lang === "AR" ? "تكلفة الجلسات" : "Session Cost"}</h2>
                  <p>${sessionCost}</p>
              </section>
              <hr>

              <section>
                  <h2>${lang === "AR" ? "التعامل مع المعلومات الشخصية" : "Handling Personal Information"}</h2>
                  <p>${handlingPersonalInfo}</p>
              </section>
              <hr>

              <section>
                  <h2>${lang === "AR" ? "الأسئلة الشائعة" : "Common Questions"}</h2>
                  <p>${commonQuestions}</p>
              </section>

          </body>
          </html>
      `;

      res.status(200).send(htmlContent);
  } catch (error) {
      res.status(500).send(`
          <!DOCTYPE html>
          <html>
          <head><title>Error</title></head>
          <body>
              <h1>Error</h1>
              <p>Internal Server Error: ${error.message}</p>
          </body>
          </html>
      `);
  }
};

