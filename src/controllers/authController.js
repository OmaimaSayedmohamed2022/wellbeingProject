// import jwt from 'jsonwebtoken';
// import bcrypt from 'bcryptjs';
// import { Beneficiary } from '../models/beneficiaryModel.js';
// import Specialist  from '../models/specialistModel.js';
// import logger from '../config/logger.js';
// import { Notification } from '../models/notificationModel.js';

// export const loginUser = async (req, res) => {
//   const { email, password } = req.body;
//   onst io = req.app.get("io");
//   try {
//     // Check if the user exists in Beneficiary collection
//     let user = await Beneficiary.findOne({ email });
//     let userType = 'Beneficiary';
    
//     if (!user) {
//       user = await Specialist.findOne({ email });
//       userType = 'Specialist';
//     }

//     if (!user) {
//       logger.warn(`Login failed for email: ${email} - User not found.`);
//       return res.status(404).json({ message: 'User not found.' });
//     }

//     // Check if the password matches
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       logger.warn(`Invalid password attempt for email: ${email}`);
//       return res.status(401).json({ message: 'Invalid email or password.' });
//     }

//     // Generate JWT token
//     const token = jwt.sign(
//       {
//         id: user._id,
//         email: user.email,
//         role: user.role || userType, 
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' }
//     );

//     logger.info(`User logged in successfully as ${userType}: ${email}`);

//         const notification = new Notification({
    //   message: 'Login Successfully',
    //   userId: user._id,
    // });
    // await notification.save();

    // // إرسال الإشعار عبر الـ Socket
    // if (io) {
    //   io.emit("receiveNotification", {
    //     message: 'Login Successfully',
    //     userId: user._id
    //   });
    // }

//     // Send response
//     res.status(200).json({
//       token,
//       user: {
//         id: user._id,
//         email: user.email,
//         role: user.role || userType,
//       },
//     });
//   } catch (error) {
//     logger.error('Error in loginUser:', error);
//     res.status(500).json({ message: 'Server error.' , error});
//   }
// };



//add notification 
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Beneficiary } from '../models/beneficiaryModel.js';
import Specialist from '../models/specialistModel.js';
import logger from '../config/logger.js';
import { Notification } from '../models/notificationModel.js';

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const io = req.app.get("io"); // إعادة التفعيل

  try {
    // البحث عن المستخدم في مجموعتي Beneficiary و Specialist
    let user = await Beneficiary.findOne({ email });
    let userType = 'Beneficiary';

    if (!user) {
      user = await Specialist.findOne({ email });
      userType = 'Specialist';
    }

    if (!user) {
      logger.warn(`Login failed for email: ${email} - User not found.`);
      return res.status(404).json({ message: 'User not found.' });
    }

    // التحقق من كلمة المرور
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Invalid password attempt for email: ${email}`);
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // إنشاء التوكن
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role || userType,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    logger.info(`User logged in successfully as ${userType}: ${email}`);

    // إنشاء إشعار تسجيل الدخول
    const notification = new Notification({
      message: 'Login Successfully',
      userId: user._id,
    });
    await notification.save();

    // إرسال الإشعار عبر الـ Socket
    if (io) {
      io.emit("receiveNotification", {
        message: 'Login Successfully',
        userId: user._id
      });
    }

    // إرسال الاستجابة
    return res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role || userType,
      },
    });
  } catch (error) {
    logger.error(`Error in loginUser: ${error.message}`, { error });
    return res.status(500).json({ message: 'Server error.', error });
  }
};
