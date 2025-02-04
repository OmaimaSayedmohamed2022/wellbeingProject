import mongoose from 'mongoose';

const specialistSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  nationality: { type: String, required: true },
  work: { type: String, required: true },
  workAddress: { type: String, required: true },
  homeAddress: { type: String, required: true },
  bio: { type: String, rوequired: true },
  sessionPrice: { type: Number, required: true },
  yearsExperience: { type: Number, required: true },
  sessionDuration: { type: Number, required: true },
  availableSlots: {type:[String] } ,
  files: {
    idOrPassport: { type: String, required: true },
    resume: { type: String, required: true },
    certificates: { type: [String], required: true },
    ministryLicense: { type: String, required: true },
    associationMembership: { type: String, required: true }
  },
 
specialties: {
    psychologicalDisorders: [
      {
        type: String,
        enum: [
          'القلق',
          'الاكتئاب',
          'الرهاب',
          'الوسواس',
          'اضطراب جنسي',
          'اضطرابات الأكل',
          'اضطراب الشخص',
          'الإدمان',
         'اضطراب الصدمة'
        ],
      },
    ],
    mentalHealth: [
      {
        type: String,
        enum: [
          'اضطرابات نفسية',
          'برامج علاجية',
          'علاج جماعي',
          'اضطرابات الأطفال',
          'حل مشكلات',
          'إرشاد وتوجيه',
         'وقاية ومتابعة نفسية',
         'اعادة تأهيل ودعم'
        ],
      },
    ],
    physicalHealth: [
      {
        type: String,
        enum: [
              'نظام غذائي',
              'نظام رياضي',
              'فحوص دورية',
              'عناية صحية'
            ],
      },
    ],
    skillDevelopment: [
      {
        type: String,
        enum: [
            'الاسترخاء',
            'تحمل الضغوط',
            'ضبط المشاعر',
            'استراجيات جدلية حل',
            'تحقيق التوازن',
            'تحسين الثقة',
            'تحقيق الأهداف',
            'تحقيق النجاح',
            'اضطراب الصدمة',
        ],
      },
    ],
  },
});

const Specialist = mongoose.model('Specialist', specialistSchema);
export default Specialist;
