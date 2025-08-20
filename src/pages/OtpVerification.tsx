import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { functions, db } from "@/lib/firebase";
import { httpsCallable } from "firebase/functions";
import { toast } from "sonner";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, verifyOtp, sendSignupOtpFunction } from "@/lib/firebase";
import { getRouteState, clearRouteState } from "@/lib/routeUtils";
import { Shield, CheckCircle, RefreshCw, AlertCircle, X } from "lucide-react";
import { motion } from "framer-motion";

export default function OtpVerification() {
  const location = useLocation();
  const navigate = useNavigate();
  const [stateData, setStateData] = useState(() => {
    // Try to get data from location.state first
    const routeState = getRouteState(location, "/verify-otp");
    if (routeState?.email) {
      console.log("Found state in route utils:", routeState);
      return routeState;
    }
    
    // Fallback to direct location state
    if (location.state?.email) {
      console.log("Found state in location:", location.state);
      return location.state;
    }
    
    // Fallback to localStorage for Google auth redirect
    const storedData = localStorage.getItem('googleUserData');
    if (storedData) {
      try {
        const userData = JSON.parse(storedData);
        console.log("Found userData in localStorage:", userData);
        return {
          email: userData.email,
          mode: "google-register",
          userData: userData
        };
      } catch (e) {
        console.error("Error parsing googleUserData:", e);
      }
    }
    
    // Last fallback - just check for an email
    const pendingEmail = localStorage.getItem('pendingOtpEmail');
    if (pendingEmail) {
      console.log("Found only email in localStorage:", pendingEmail);
      return {
        email: pendingEmail,
        mode: "google-register", // Assume it's for Google if coming from localStorage
      };
    }
    
    console.log("No state found for OtpVerification");
    return {};
  });
  
  const { email, mode, userData, redirectAfter } = stateData;
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isSkippingVerification, setIsSkippingVerification] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Check if required state is available
  useEffect(() => {
    console.log("OtpVerification mounted, state:", { email, mode, userData });
    
    if (!email) {
      toast.error("Missing email information");
      navigate("/login");
      return;
    }
    
    // For Google registration, send OTP if not sent
    if (mode === "google-register") {
      sendOtpForGoogleUser();
    }
  }, [email, navigate, mode]);

  // Handle countdown timer for resend
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);
  
  const sendOtpForGoogleUser = async () => {
    if (isSendingOtp) return;
    
    if (!email) {
      toast.error("Email is missing");
      return;
    }
    
    setIsSendingOtp(true);
    try {
      console.log("Sending OTP for Google user:", email);
      const result = await sendSignupOtpFunction(email);
      console.log("Google OTP result:", result);
      
      if (result && result.success) {
        toast.success("OTP sent to your email for verification");
        setCountdown(60); // Start countdown for resend
      } else {
        throw new Error("Failed to send OTP: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error sending OTP for Google user:", error);
      toast.error("Could not send verification code. " + (error.message || "Please try again."));
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerify = async () => {
    if (!email || !otp) {
      toast.error("Email and OTP are required");
      return;
    }
    
    setIsVerifying(true);
    try {
      console.log("Verifying OTP:", otp, "for email:", email);
      const result = await verifyOtp(email, otp);
      console.log("Verification result:", result);
      
      if (result && result.success) {
        toast.success("Email verified successfully!");
        
        if (mode === "register" || mode === "google-register") {
          await handleRegistrationComplete();
        } else if (mode === "login") {
          await handleLoginComplete();
        } else {
          console.warn("Unknown verification mode:", mode);
          navigate("/dashboard");
        }
      } else {
        throw new Error("Verification failed: " + (result.error || "Invalid OTP"));
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error(error.message || "Failed to verify OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };
  
  const handleResendOtp = async () => {
    if (isSendingOtp || countdown > 0) return;
    
    setIsSendingOtp(true);
    try {
      console.log("Resending OTP to:", email);
      const result = await sendSignupOtpFunction(email);
      
      if (result && result.success) {
        toast.success("New OTP sent to your email");
        setCountdown(60); // Start countdown for resend
      } else {
        throw new Error("Failed to resend OTP: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      toast.error("Failed to resend OTP: " + error.message);
    } finally {
      setIsSendingOtp(false);
    }
  };
  
  // Handle Google auth by skipping OTP (recovery option)
  const handleSkipVerification = async () => {
    if (!email || !userData || !userData.uid) {
      toast.error("Missing user information. Cannot proceed.");
      return;
    }
    
    setIsSkippingVerification(true);
    try {
      console.log("Skipping verification for Google user:", email);
      
      // Check if user document already exists
      const userDoc = await getDoc(doc(db, "users", userData.uid));
      
      if (userDoc.exists()) {
        // Just update the verification status
        await updateDoc(doc(db, "users", userData.uid), {
          verifiedByOtp: true,
          verificationSkipped: true,
          updatedAt: new Date().toISOString()
        });
      } else {
        // Create full user document
        await setDoc(doc(db, "users", userData.uid), {
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email,
          phoneNumber: userData.phoneNumber || '',
          providerId: 'google.com',
          createdAt: new Date().toISOString(),
          verifiedByOtp: true,
          verificationSkipped: true
        });
      }
      
      // Clean up localStorage
      localStorage.removeItem('googleUserData');
      localStorage.removeItem('pendingOtpEmail');
      
      toast.success("Account verified! Redirecting...");
      
      // Navigate to the saved redirect path or dashboard as default
      const redirectPath = redirectAfter || "/dashboard";
      console.log("After skipping verification: Redirecting to:", redirectPath);
      
      // Use window.location for a hard redirect to ensure state is refreshed
      window.location.href = redirectPath;
    } catch (error) {
      console.error("Error skipping verification:", error);
      toast.error("Failed to verify account: " + (error.message || "Unknown error"));
    } finally {
      setIsSkippingVerification(false);
    }
  };

  const handleRegistrationComplete = async () => {
    try {
      if (mode === "register" && userData) {
        // For email/password registration
        console.log("Creating user document for new registration");
        await setDoc(doc(db, "users", auth.currentUser.uid), {
          ...userData,
          createdAt: new Date().toISOString(),
          verifiedByOtp: true
        });
      } else if (mode === "google-register" && userData && userData.uid) {
        // For Google registration
        console.log("Updating Google user document after OTP verification");
        
        // Check if document exists first
        const userDoc = await getDoc(doc(db, "users", userData.uid));
        
        if (userDoc.exists()) {
          // Update existing document
          await updateDoc(doc(db, "users", userData.uid), {
            verifiedByOtp: true,
            updatedAt: new Date().toISOString()
          });
        } else {
          // Create new document
          await setDoc(doc(db, "users", userData.uid), {
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email,
            phoneNumber: userData.phoneNumber || '',
            providerId: 'google.com',
            createdAt: new Date().toISOString(),
            verifiedByOtp: true
          });
        }
      } else {
        console.warn("Missing user data for registration completion");
      }
      
      // Clean up localStorage
      localStorage.removeItem('googleUserData');
      localStorage.removeItem('pendingOtpEmail');
      
      toast.success("Account created successfully!");
      
      // Navigate to the saved redirect path or dashboard as default
      const redirectPath = redirectAfter || "/dashboard";
      console.log("After verification: Redirecting to path:", redirectPath);
      
      // Use window.location for a hard redirect to ensure state is refreshed
      window.location.href = redirectPath;
    } catch (error) {
      console.error("Error completing registration:", error);
      toast.error("Error creating account: " + error.message);
    }
  };

  const handleLoginComplete = async () => {
    try {
      console.log("Login verification successful");
      
      // Navigate to the saved redirect path or dashboard as default
      const redirectPath = redirectAfter || "/dashboard";
      console.log("After login verification: Redirecting to:", redirectPath);
      
      // Use window.location for a hard redirect to ensure state is refreshed
      window.location.href = redirectPath;
    } catch (error) {
      console.error("Error completing login:", error);
      toast.error("Error signing in: " + error.message);
    }
  };

  // Render a more informative UI
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-background to-background/60 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full mx-auto p-8 bg-card rounded-xl shadow-lg border border-border"
      >
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
            className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4"
          >
            <Shield className="h-8 w-8 text-primary" />
          </motion.div>
          
          <h1 className="text-2xl font-bold">Email Verification</h1>
          <p className="text-muted-foreground mt-1">
            {mode === "google-register" 
              ? "Verify your Google account email" 
              : mode === "register" 
                ? "Complete your registration" 
                : "Verify your identity"}
          </p>
          
          {email && (
            <div className="mt-2 py-1 px-3 bg-muted inline-block rounded-full">
              <p className="text-sm font-medium">{email}</p>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="otp" className="text-sm font-medium block">
              Enter Verification Code
            </label>
            <Input
              id="otp"
              placeholder="Enter the 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="text-center text-lg font-bold tracking-widest"
              disabled={isVerifying}
            />
            <p className="text-xs text-muted-foreground">
              Check your email for a 6-digit verification code
            </p>
          </div>
          
          <Button 
            onClick={handleVerify} 
            disabled={!otp || isVerifying || otp.length < 6} 
            className="w-full"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Verify Code
              </>
            )}
          </Button>
          
          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isSendingOtp || countdown > 0}
              className="text-sm text-primary hover:underline focus:outline-none disabled:text-muted-foreground disabled:no-underline"
            >
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
            </button>
            
            {mode === "google-register" && (
              <button
                type="button"
                onClick={handleSkipVerification}
                disabled={isSkippingVerification}
                className="text-sm text-primary hover:underline focus:outline-none"
              >
                {isSkippingVerification ? 'Processing...' : 'Skip Verification'}
              </button>
            )}
          </div>
          
          {mode === "google-register" && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 rounded-lg text-sm">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <p>
                  If you're not receiving the verification code, you can skip verification
                  and proceed directly to your dashboard. However, some features may require
                  verified email access.
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-6 pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="flex items-center text-sm text-muted-foreground hover:text-primary"
          >
            <X className="h-4 w-4 mr-1" />
            Cancel and return to login
          </button>
        </div>
      </motion.div>
    </div>
  );
}