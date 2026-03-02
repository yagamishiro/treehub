import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (email: string, code: string) => {
  if (process.env.ENABLE_EMAIL_NOTIFICATIONS !== 'true') return;
  
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"TreeHub" <no-reply@treehub.com>',
    to: email,
    subject: 'Verify your TreeHub Account',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #059669;">Welcome to TreeHub!</h2>
        <p>Your verification code is:</p>
        <div style="background: #f0fdf4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #059669; border-radius: 8px; margin: 20px 0;">
          ${code}
        </div>
        <p>Please enter this code in the app to verify your account.</p>
        <p style="color: #64748b; font-size: 12px; margin-top: 40px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
};

export const sendMessageNotificationEmail = async (email: string, senderName: string, listingTitle: string, content: string) => {
  if (process.env.ENABLE_EMAIL_NOTIFICATIONS !== 'true') return;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"TreeHub" <no-reply@treehub.com>',
    to: email,
    subject: `New message from ${senderName} regarding ${listingTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #059669;">New Message Received</h2>
        <p><strong>${senderName}</strong> sent you a message regarding <strong>${listingTitle}</strong>:</p>
        <div style="background: #f8fafc; padding: 15px; border-left: 4px solid #059669; margin: 20px 0; color: #334155;">
          ${content}
        </div>
        <p>Login to the app to reply.</p>
      </div>
    `,
  });
};

export default transporter;
