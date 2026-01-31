import { Resend } from "resend";

let resendClient = null;

/* ===============================
   Lazy Resend Client (ESM SAFE)
================================ */
function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("❌ RESEND_API_KEY is missing");
  }

  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }

  return resendClient;
}

/* ===============================
   OTP HTML Template
================================ */
export const getOTPTemplate = (otp, userName = "User") => {
  return `
  <!DOCTYPE html>
  <html>
  <body style="font-family:Arial;background:#f4f7f6;padding:20px;">
    <div style="max-width:600px;margin:auto;background:#fff;padding:30px;border-radius:8px;">
      <h2>sKILL2HIRE</h2>
      <p>Hi ${userName},</p>
      <p>Your OTP is valid for 10 minutes:</p>
      <h1 style="letter-spacing:6px;color:#2563eb;">${otp}</h1>
      <p style="font-size:12px;color:#666;">Ignore if not requested.</p>
    </div>
  </body>
  </html>
  `;
};

/* ===============================
   Send Email Function
================================ */
export const sendEmail = async ({ email, subject, html }) => {
  try {
    const resend = getResendClient();

    return await resend.emails.send({
      from: process.env.EMAIL_FROM || "sKILL2HIRE <onboarding@resend.dev>",
      to: email,
      subject,
      html,
    });
  } catch (error) {
    console.error("📧 Resend Error:", error.message);
    throw error; // BullMQ retry
  }
};
