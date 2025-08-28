import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
import cors from 'cors';
import { Request, Response } from 'express';
import axios from 'axios';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';


admin.initializeApp();
const db = admin.firestore();
const corsHandler = cors({ origin: true }); // <- Allow all origins for now (can be restricted later)

// 📧 Configure nodemailer with Gmail app password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'guidmenext5@gmail.com',         // Your Gmail address
    pass: 'ryxvxztqibhuzcpz',              // Gmail app password (not regular password)
  },
});

// 🔐 Callable Function - Send OTP to email
export const sendLoginOtp = functions
  .region('us-central1')
  .https
  .onCall(async (data, context) => {
    const email = data?.email;

    if (!email) {
      throw new functions.https.HttpsError('invalid-argument', 'Email is required.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await db.collection('otp_verifications').doc(email).set({
      otp,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const mailOptions = {
  from: 'GuidmeNext <guidmenext5@gmail.com>',
  to: email,
  subject: 'Your Guidmenext Verification Code',
  text: `Dear User,

Thank you for choosing Guidmenext,
your trusted platform for student guidance and support.

Your One-Time Password (OTP) is: ${otp}

Please enter this code to proceed with your verification.
This OTP is valid for 5 minutes.

Warm regards,
The Guidmenext Team`,
  html: `
    <p>Dear User,</p>

    <p>Thank you for choosing <strong>Guidmenext</strong>,<br>
    your trusted platform for student guidance and support.</p>

    <p>Your One-Time Password (OTP) is:<br>
    <strong style="font-size: 1.2em;">${otp}</strong></p>

    <p>Please enter this code to proceed with your verification.<br>
    This OTP is valid for <strong>5 minutes</strong>.</p>

    <p>Warm regards,<br>
    The Guidmenext Team</p>
  `
};

    await transporter.sendMail(mailOptions);
    return { success: true };
  });

// ✅ HTTP Function - Verify OTP via query parameters
export const verifyOtp = functions
  .region('us-central1')
  .https
  .onRequest(async (req: Request, res: Response) => {
    corsHandler(req, res, async () => {
    const { email, otp } = req.query;

    if (!email || !otp || typeof email !== 'string' || typeof otp !== 'string') {
      res.status(400).json({ success: false, message: 'Email and OTP required.' });
      return;
    }

    try {
      const doc = await db.collection('otp_verifications').doc(email).get();

      if (!doc.exists) {
        res.status(404).json({ success: false, message: 'No OTP found for this email.' });
        return;
      }

      const otpData = doc.data();
      const now = admin.firestore.Timestamp.now().toMillis();
      const created = otpData?.createdAt instanceof admin.firestore.Timestamp ? otpData.createdAt.toMillis() : null;

      const isExpired = !created || now - created > 5 * 60 * 1000;

      if (otpData?.otp === otp && !isExpired) {
        res.status(200).json({ success: true });
      } else {
        res.status(401).json({ success: false, message: 'Invalid or expired OTP.' });
      }
    } catch (error) {
      console.error('[verifyOtp error]', error);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  });
});


// 🔄 Callable Function - Fetch and post jobs
export const fetchAndPostJobs = functions
  .region('us-central1')
  .https
  .onRequest((req: Request, res: Response) => {
    corsHandler(req, res, async () => {
      async function uploadEmployerLogo(logoUrl: string): Promise<string> {
  try {
    if (!logoUrl || typeof logoUrl !== 'string') {
      throw new Error('Invalid logo URL');
    }

    console.log(`📥 Downloading logo: ${logoUrl}`);
    const response = await axios.get(logoUrl, { responseType: 'arraybuffer' });
    const fileBuffer = Buffer.from(response.data, 'binary');
    const ext = path.extname(new URL(logoUrl).pathname) || '.png';
    const filename = `jobs/${Date.now()}_${uuidv4()}${ext}`;
    
    const file = admin.storage().bucket().file(filename);
    const token = uuidv4();

    await file.save(fileBuffer, {
      metadata: {
        contentType: response.headers['content-type'] || 'image/png',
        metadata: {
          firebaseStorageDownloadTokens: token
        }
      }
    });

    const bucketName = admin.storage().bucket().name;
    const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(filename)}?alt=media&token=${token}`;
    console.log(`✅ Uploaded to Firebase Storage: ${downloadURL}`);
    return downloadURL;

  } catch (err) {
    console.warn('⚠️ Failed to upload logo. Using placeholder.');
    return 'https://i.ibb.co/YTY9y0XW/noimage.jpg';
  }
}

      async function addJobToFirestore(job: any, imageUrl: string) {
        const jobData = {
          applyLink: job.job_apply_link,
          company: job.employer_name,
          createdAt: admin.firestore.Timestamp.now(),
          description: job.job_description?.substring(0, 300) || 'No description provided',
          images: [imageUrl],
          lastDateToApply: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          location: `${job.job_city || 'Unknown'}, ${job.job_country}`,
          salary:
            job.job_min_salary && job.job_max_salary
              ? `${job.job_min_salary} - ${job.job_max_salary} ${job.job_salary_currency || ''}`
              : 'Not specified',
          title: job.job_title,
          type: job.job_employment_type || 'N/A',
        };

        await db.collection('jobs').add(jobData);
      }

      try {
        const response = await axios.request({
          method: 'GET',
          url: 'https://jsearch.p.rapidapi.com/search',
          params: {
            query: 'Developer in India',
            page: '1',
            num_pages: '1',
          },
          headers: {
            'X-RapidAPI-Key': '47361b5420msh29c8308d10e75e0p1f3cc0jsn32571aec2008',
            'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
          },
        });

        const jobs = response.data.data.filter((job: any) =>
          job.job_country?.toLowerCase().includes('india') ||
          job.job_location?.toLowerCase().includes('india') ||
          job.job_city?.toLowerCase().includes('india')
        );

        for (const job of jobs) {
          const logoUrl = job.employer_logo;
          const uploadedImageUrl = logoUrl
            ? await uploadEmployerLogo(logoUrl)
            : 'https://i.ibb.co/YTY9y0XW/noimage.jpg';
          console.log("📝 Adding job with image URL:", uploadedImageUrl);
          await addJobToFirestore(job, uploadedImageUrl);
        }

        res.status(200).json({ success: true, count: jobs.length });
      } catch (error: any) {
        console.error('❌ Job fetch failed:', error.message);
        res.status(500).json({ success: false, error: error.message });
      }
    });
  });





  //Callable Function for sending emails
  export const onSendEmail = functions
  .region('us-central1')
  .https
  .onCall(async (data, context) => {
    const { to, subject, message } = data;

    if (!to || !subject || !message) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing email parameters.');
    }
    const recipients = Array.isArray(to) ? to.join(", ") : to;
    const mailOptions = {
      from: 'GuidmeNext <guidmenext5@gmail.com>',
      to: recipients, // ✅ now handles array or single string
      subject,
      text: message,
      html: `<p>${message}</p>`,
    };

    try {
      await transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('[onSendEmail error]', error);
      throw new functions.https.HttpsError('internal', 'Failed to send email.');
    }
  });
