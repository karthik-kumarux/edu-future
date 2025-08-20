import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { getFunctions, httpsCallable } from 'firebase/functions';

// 🔐 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBzJw9sLxQlWD52UlBUdANdQu-xqCJ2z8Y",
  authDomain: "guidmenext-d65a9.firebaseapp.com",
  projectId: "guidmenext-d65a9",
  storageBucket: "guidmenext-d65a9.firebasestorage.app",
  messagingSenderId: "948814752784",
  appId: "1:948814752784:web:9f30062ca321f493526e95",
  measurementId: "G-J4SVYK5YHC"
};

// 🚀 Initialize Firebase App
const app = initializeApp(firebaseConfig);

// 🔧 Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
export const functions = getFunctions(app, 'us-central1'); // Specify the region

// Set persistence to LOCAL (survives browser restarts)
try {
  setPersistence(auth, browserLocalPersistence)
    .then(() => console.log("Auth persistence set to LOCAL"))
    .catch(error => console.error("Error setting persistence:", error));
} catch (error) {
  console.error("Failed to set auth persistence:", error);
}

// Enable debugging in development mode
if (process.env.NODE_ENV === 'development') {
  console.log('Firebase initialized in development mode');
}

// 📲 Callable Functions for OTP
const rawSendLoginOtp = httpsCallable(functions, 'sendLoginOtp');
const rawSendSignupOtp = httpsCallable(functions, 'sendLoginOtp'); // Using same function for both login and signup

// Helper function for login OTP
export async function sendLoginOtpFunction(email: string) {
  try {
    console.log(`Sending login OTP to ${email} using cloud function`);
    const result = await rawSendLoginOtp({ email });
    
    if (result.data && typeof result.data === 'object') {
      console.log('Login OTP cloud function result:', result.data);
      return {
        success: 'success' in result.data ? result.data.success : false,
        error: 'error' in result.data ? result.data.error : null
      };
    }
    
    console.error('Unexpected login OTP result format:', result);
    return { success: false, error: 'Invalid response from server' };
  } catch (error) {
    console.error('Error in sendLoginOtpFunction:', error);
    return {
      success: false,
      error: error.message || 'Failed to send OTP'
    };
  }
}

// Helper function for signup OTP
export async function sendSignupOtpFunction(email: string) {
  try {
    console.log(`Sending signup OTP to ${email} using cloud function`);
    const result = await rawSendSignupOtp({ email });
    
    if (result.data && typeof result.data === 'object') {
      console.log('Signup OTP cloud function result:', result.data);
      
      // Store the email in localStorage as a backup
      try {
        localStorage.setItem('pendingOtpEmail', email);
      } catch (e) {
        console.warn('Could not store email in localStorage:', e);
      }
      
      return {
        success: 'success' in result.data ? result.data.success : false,
        error: 'error' in result.data ? result.data.error : null
      };
    }
    
    console.error('Unexpected signup OTP result format:', result);
    return { success: false, error: 'Invalid response from server' };
  } catch (error) {
    console.error('Error in sendSignupOtpFunction:', error);
    return {
      success: false,
      error: error.message || 'Failed to send OTP'
    };
  }
}

// Helper function to verify OTP
export async function verifyOtp(email: string, otp: string) {
  try {
    console.log(`Verifying OTP for ${email}`);
    const projectId = "guidmenext-d65a9";
    const response = await fetch(
      `https://us-central1-${projectId}.cloudfunctions.net/verifyOtp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('OTP verification result:', result);
    return result;
  } catch (error) {
    console.error('Error in verifyOtp function:', error);
    return {
      success: false,
      message: error.message || 'OTP verification failed'
    };
  }
}

export default app;
