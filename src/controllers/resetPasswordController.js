import VerificationCode from '../models/verifyCodeModel.js';
import { generateVerificationCode } from '../nodemailer/generateCode.js';
import { sendMail } from '../nodemailer/sendMail.js';
import bcrypt from 'bcryptjs';

export const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    try {
        const verificationCode = generateVerificationCode();
        // Valid for 10 minutes
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

        // Save or update the verification code in the database
        const updatedVerification = await VerificationCode.findOneAndUpdate(
            { email: email },
            { code: verificationCode, expiresAt },
            { upsert: true, new: true }
        );

        console.log("Verification code saved/updated:", updatedVerification);

        // Send verification code via email
        await sendMail(email, "Your Verification Code", `Your verification code is: ${verificationCode}`);
        console.log("verification code:", verificationCode)

        res.status(200).json({ message: "Verification code sent to your email" });
    } catch (error) {
        console.error("Error in requestPasswordReset:", error);
        res.status(500).json({ message: "Error sending verification code", error: error.message });
    }
 
};

//  Verify the provided code
export const verifyCode = async (req, res) => {
    try {
        const {email,code } = req.body;
        
        const verification = await VerificationCode.findOne({email});

        if (!verification) {
            console.log(`No verification code found for email: ${email}`);
            return res.status(400).json({ message: "No verification code found for this email" });
        }
        // Check if the code has expired
        if (new Date() > verification.expiresAt) {
            console.log(`Verification code expired for email: ${email}`);
            return res.status(400).json({ message: "Verification code has expired" });
        }
        //  check if code mismatch
        if (verification.code.toString() === code.toString()) {
            await VerificationCode.deleteOne({ email});
            res.status(200).json({ message: "Verification code verified successfully" });
        } else {
            console.log(`Invalid verification code entered for email: ${email}`);
            res.status(400).json({ message: "Invalid verification code" });
        }
    } catch (error) {
        console.error("Error verifying code:", error.message);
        res.status(500).json({ message: "Error verifying the code", error: error.message });
    }
};

//  Reset the password
export const resetPassword = async (req, res) => {
    try {
    const { password } = req.body;
    const user = req.user;
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    await user.save({ validate: false });

    res.status(200).json({ message: "Password has been reset successfully" ,user});
    } catch (error) {
        console.error("Error in resetPassword:", error);
        res.status(500).json({ message: "Error resetting password", error: error.message });
    }
};
