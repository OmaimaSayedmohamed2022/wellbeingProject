import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    // service: "gmail",
    host: process.env.E_HOST || "smtp.gmail.com",
    port: parseInt(process.env.E_PORT, 10) || 587,
    secure: false, 
    auth: {
        user: process.env.E_USER, 
        pass: process.env.E_PASSWORD, 
    },
    debug: true,
    logger: true,
});

/**
 * Send an email using the configured transporter.
 * @param {string} to - Recipient email address.
 * @param {string} subject - Email subject.
 * @param {string} text - Plain text content of the email.
 */

export const sendMail = async (to, subject, text) => {
    try {
        const mailOptions = {
            from: `"Wellbeing Day" <${process.env.E_USER}>`,
            to: to, // Assign the recipient email address
            subject: subject, // Assign the subject
            text: text, // Assign the plain text content
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${to}`);
    } catch (error) {
        console.error("Error sending email:", error.message);
        throw new Error("Failed to send email");
    }
};

// transporter.verify((error, success) => {
//     if (error) {
//         console.error("SMTP Connection Error:", error);
//     } else {
//         console.log("SMTP Connection Successful");
//     }
// });

