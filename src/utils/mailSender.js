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
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Email Verification</title>
</head>

<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0"
          style="max-width:600px;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#2563eb;padding:24px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;letter-spacing:1px;">
                sKILL2HIRE
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:32px;color:#111827;">
              <h2 style="margin-top:0;font-size:20px;">Verify your email address</h2>

              <p style="font-size:14px;line-height:1.6;color:#374151;">
                Hi <strong>${userName}</strong>,
              </p>

              <p style="font-size:14px;line-height:1.6;color:#374151;">
                Use the One-Time Password (OTP) below to complete your login.
                This code is valid for <strong>10 minutes</strong>.
              </p>

              <!-- OTP Box -->
              <div style="margin:30px 0;text-align:center;">
                <div
                  style="display:inline-block;padding:14px 32px;
                         font-size:28px;font-weight:bold;
                         letter-spacing:6px;
                         color:#2563eb;
                         background:#eff6ff;
                         border-radius:8px;
                         border:1px dashed #2563eb;">
                  ${otp}
                </div>
              </div>

              <p style="font-size:13px;line-height:1.6;color:#6b7280;">
                If you did not request this email, you can safely ignore it.
                Your account remains secure.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:18px;text-align:center;background:#f9fafb;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                © 2026 sKILL2HIRE. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

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
