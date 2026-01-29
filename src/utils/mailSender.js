import nodemailer from "nodemailer";

// Professional HTML Template Function
export const getOTPTemplate = (otp, userName = "User") => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background-color:#f4f7f6;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width:600px;margin:20px auto;background-color:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.1);">
            <tr>
                <td style="padding:30px;text-align:center;background-color:#2563eb;">
                    <h1 style="margin:0;color:#ffffff;font-size:24px;text-transform:uppercase;letter-spacing:2px;">sKILL2HIRE</h1>
                </td>
            </tr>
            <tr>
                <td style="padding:40px 30px;color:#333333;">
                    <h2 style="margin-top:0;color:#1f2937;font-size:22px;">Verify Your Email</h2>
                    <p>Hi ${userName},</p>
                    <p>Welcome to <b>sKILL2HIRE</b>. Use the OTP below to complete your registration. This code is valid for 10 minutes.</p>
                    <div style="margin:30px 0;text-align:center;">
                        <div style="display:inline-block;padding:15px 35px;font-size:32px;font-weight:bold;color:#2563eb;background-color:#eff6ff;border:2px dashed #2563eb;border-radius:8px;letter-spacing:5px;">
                            ${otp}
                        </div>
                    </div>
                    <p style="font-size:13px;color:#6b7280;line-height:1.6;">If you did not request this email, please ignore it or contact support if you have concerns.</p>
                </td>
            </tr>
            <tr>
                <td style="padding:20px;text-align:center;background-color:#f9fafb;color:#9ca3af;font-size:12px;border-top:1px solid #eeeeee;">
                    <p style="margin:0;">&copy; 2026 sKILL2HIRE. All rights reserved.</p>
                </td>
            </tr>
        </table>
    </body>
    </html>`;
};

// Main Email Sender Function
export const sendEmail = async ({ email, subject, html }) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465, // Force SSL for Render stability
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS, // Use 16-digit App Password
            },
            // Timeout settings to prevent ETIMEDOUT on Render
            connectionTimeout: 15000, 
            socketTimeout: 15000,
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
        // Log the actual error for debugging
        console.error("📧 Nodemailer Error Details:", error.message);
        throw error; // Throwing error so BullMQ can catch it and retry if needed
    }
};