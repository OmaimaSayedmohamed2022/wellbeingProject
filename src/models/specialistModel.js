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
  bio: { type: String, required: true }, // Fixed typo
  sessionPrice: { type: Number, required: true },
  yearsExperience: { type: Number, required: true },
  sessionDuration: { type: Number, required: true },
  isConfirmed: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: false },
  sessions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
  }],
  files: {
    idOrPassport: { type: String, required: false },
    resume: { type: String, required: false },
    certificates: { type: [String], required: false }, // Optional array of strings
    ministryLicense: { type: String, required: false },
    associationMembership: { type: String, required: false },
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
          'اضطراب الصدمة',
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
          'تشخيص وتحفيز',
          'إرشاد وتوجيه',
          'وقاية ومتابعة نفسية',
          'اعادة تأهيل ودعم',
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
          'عناية صحية',
        ],
      },
    ],
    skillsDevelopment: [
      {
        type: String,
        enum: [
          'الاسترخاء',
          'تحمل الضغوط',
          'ضبط المشاعر',
          'استراتيجيات جدلية حل',
          'تحقيق التوازن',
          'تحسين الثقة',
          'تحقيق الأهداف',
          'تحقيق النجاح',
          'اضطراب الصدمة',
        ],
      },
    ],
  },
  imageUrl: { type: String, required: false },
  availableSlots: { type: [String], default: [] },
  language: {
    type: [String],
    default: ["Arabic"], 
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
    },
  ],
});

const Specialist = mongoose.model('Specialist', specialistSchema);
export default Specialist;