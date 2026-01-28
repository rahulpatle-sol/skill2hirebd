
import nodemailer from "nodemailer";

export const sendEmail = async ({ email, subject, html }) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            debug:true,
            looger:true
        });

        const mailOptions = {
            from: `"sKILL2HIRE" <${process.env.SMTP_USER}>`,
            to: email,
            subject: subject,
            html: html,
        };

        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.log("Email error: ", error);
        return null;
    }   
};