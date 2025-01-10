import nodemailer from "nodemailer";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const { OAuth2 } = google.auth;
const oauth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    "https://wellbeing.com/oauth2callback"
);

oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
});

const createTransporter = async () => {
    const accessToken = await oauth2Client.getAccessToken();
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: "wellbeingday2025@gmail.com",
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN,
            accessToken: accessToken.token,
        },
    });
};

export const sendMail = async (recipientEmail, subject, text) => {
    try {
        const transporter = await createTransporter();
        const mailOptions = {
            from: "Wellbeing Day <wellbeingday2025@gmail.com>",
            to: recipientEmail,
            subject: subject,
            text: text,
        };
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");
    } catch (error) {
        console.error("Error sending email:", error.message);
    }
};
