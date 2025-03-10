export const categories = {
  mentalHealth: {
    ar: [
      {
        name: 'اضطرابات نفسية',
        subcategory: ['القلق', 'الاكتئاب', 'الرهاب', 'الوسواس', 'اضطراب جنسي', 'اضطراب الاكل'],
      },
      {
        name: 'اضطراب شخصي',
        subcategory: ['حدي', 'نرجسي', 'وسواس', 'اعتمادي', 'رهابي', 'انحرافي'],
      },
      'الادمان',
      'اضطراب الصدمة',
      {
        name: 'برامج علاجية',
        subcategory: [
          'القلق',
          'الاكتئاب',
          'الرهاب',
          'الوسواس',
          'اضطراب جنسي',
          'اضطراب الاكل',
          'اضطراب شخصي',
          'الادمان',
          'اضطراب الصدمة',
        ],
      },
      'علاج جماعي',
      {
        name: 'اضطرابات الأطفال',
        subcategory: [
          'صعوبات التعلم',
          'صعوبات النطق',
          'فرط الحركة',
          'التوحد',
          'الكذب',
          'السرقة',
          'العناد',
          'الادمان',
          'التعلثم',
          'التعلق',
        ],
      },
      {
        name:'تشخيص وتحفيز',
        subcategory: ['مشاكل أسريه', 'مشاكل علاقات', 'مشاكل ثنائية', 'غضب', 'مشاكل عمل', 'عنف'],
      },
      'ارشاد وتوجيه',
      {
        name: 'وقاية ومتابعة نفسية',
        subcategory: [
          'تنمية الاستقلاليه',
          'تنمية التوكيدية',
          'تنمية الثقة بالذات',
          'تنمية قوة الأنا',
          'مواجهة التحديات',
        ],
      },
      {
        name: 'اعادة تأهيل ودعم',
        subcategory: [
          'لمرض الباركنسون',
          'لمرض الزهايمر',
          'لمرض الصرع',
          'مرض عقلي',
          'مرض الذهان',
          'بعد صدمة واحداث',
        ],
      },
    ],
    en: [
      {
        name: 'Psychological Disorders',
        subcategory: ['Anxiety', 'Depression', 'Phobia', 'Obsession', 'Sexual Disorder', 'Eating Disorder'],
      },
      {
        name: 'Personality Disorder',
        subcategory: ['Borderline', 'Narcissistic', 'Obsessive', 'Dependent', 'Phobic', 'Deviant'],
      },
      'Addiction',
      'Trauma Disorder',
      {
        name: 'Therapeutic Programs',
        subcategory: [
          'Anxiety',
          'Depression',
          'Phobia',
          'Obsession',
          'Sexual Disorder',
          'Eating Disorder',
          'Personality Disorder',
          'Addiction',
          'Trauma Disorder',
        ],
      },
      'Group Therapy',
      {
        name: 'Childhood Disorders',
        subcategory: [
          'Learning Disabilities',
          'Speech Difficulties',
          'Hyperactivity',
          'Autism',
          'Lying',
          'Stealing',
          'Stubbornness',
          'Addiction',
          'Stuttering',
          'Attachment',
        ],
      },
      {
        name: 'Diagnose and motivate',
        subcategory: ['Family Problems', 'Relationship Problems', 'Couple Problems', 'Anger', 'Work Problems', 'Violence'],
      },
      'Guidance and Counseling',
      {
        name: 'Prevention and Psychological Follow-up',
        subcategory: [
          'Developing Independence',
          'Developing Assertiveness',
          'Developing Self-Confidence',
          'Developing Ego Strength',
          'Facing Challenges',
        ],
      },
      {
        name: 'Rehabilitation and Support',
        subcategory: [
          "For Parkinson's Disease",
          "For Alzheimer's Disease",
          'For Epilepsy',
          'Mental Illness',
          'Psychosis',
          'After Trauma and Events',
        ],
      },
    ],
  },
  physicalHealth: {
    ar: ['نظام غذائي', 'نظام رياضي', 'فحوص دورية', 'عناية صحية'],
    en: ['Diet Plan', 'Exercise Plan', 'Regular Check-ups', 'Health Care'],
  },
  skillDevelopment: {
    ar: [
      'الاسترخاء',
      'تحمل الضغوط',
      'ضبط المشاعر',
      'استراجيات جدلية حل',
      'تحقيق التوازن',
      'تحسين الثقة',
      'تحقيق الأهداف',
      'تحقيق النجاح',
      'العلاقات الفعالة',
    ],
    en: [
      'Relaxation',
      'Stress Management',
      'Emotional Control',
      'Dialectical Strategies',
      'Achieving Balance',
      'Improving Confidence',
      'Achieving Goals',
      'Achieving Success',
      'Effective Relationships',
    ],
  },
};

export const getAllSubcategories = (category) => {
  if (!categories[category]) return [];

  let subcategories = new Set();

  // Iterate over both 'ar' and 'en' languages
  ['ar', 'en'].forEach((lang) => {
    if (Array.isArray(categories[category][lang])) {
      categories[category][lang].forEach((item) => {
        if (typeof item === 'object' && item.name) {
          // Add the main category name (e.g., "اضطرابات نفسية")
          subcategories.add(item.name);

          // Add nested subcategories (e.g., "القلق", "الاكتئاب")
          if (item.subcategory && Array.isArray(item.subcategory)) {
            item.subcategory.forEach((sub) => subcategories.add(sub));
          }
        } else if (typeof item === 'string') {
          // Add direct subcategories (e.g., "الادمان")
          subcategories.add(item);
        }
      });
    }
  });

  return Array.from(subcategories);
};


export const subcategoryToCategoryMapping = {
  psychologicalDisorders: 'mentalHealth',
  personalityDisorder: 'mentalHealth',
  addiction: 'mentalHealth',
  traumaDisorder: 'mentalHealth',
  therapeuticPrograms: 'mentalHealth',
  groupTherapy: 'mentalHealth',
  childhoodDisorders: 'mentalHealth',
  problemSolving: 'mentalHealth',
  guidanceAndCounseling: 'mentalHealth',
  preventionAndPsychologicalFollowUp: 'mentalHealth',
  rehabilitationAndSupport: 'mentalHealth',
  dietPlan: 'physicalHealth',
  exercisePlan: 'physicalHealth',
  regularCheckUps: 'physicalHealth',
  healthCare: 'physicalHealth',
  relaxation: 'skillDevelopment',
  stressManagement: 'skillDevelopment',
  emotionalControl: 'skillDevelopment',
  dialecticalStrategies: 'skillDevelopment',
  achievingBalance: 'skillDevelopment',
  improvingConfidence: 'skillDevelopment',
  achievingGoals: 'skillDevelopment',
  achievingSuccess: 'skillDevelopment',
  effectiveRelationships: 'skillDevelopment',
};

export const sessionTypes =  ['جلسة فورية', 'استشارة مجانية',"جلسة عادية","علاج جماعي","Instant Session", "Free Session", "Regular Session", "Group Therapy"]
