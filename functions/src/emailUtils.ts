import * as nodemailer from 'nodemailer';

// Create a transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'guidmenext@gmail.com', // replace with your Gmail address
    pass: process.env.EMAIL_PASSWORD || 'your-app-password' // use environment variable for security
  }
});

// Generate a 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send an email
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  try {
    const mailOptions = {
      from: '"EduFuture" <guidmenext@gmail.com>',
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return Promise.resolve();
  } catch (error) {
    console.error('Error sending email:', error);
    return Promise.reject(error);
  }
}
