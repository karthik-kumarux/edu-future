import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff, User, UserCheck, CheckCircle, Phone, MapPin } from "lucide-react";
import { auth, db, functions, sendSignupOtpFunction } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithRedirect, GoogleAuthProvider, getRedirectResult } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { safeNavigate } from "@/lib/routeUtils";

export default function SignupForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const from = location.state?.from || "/dashboard";
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    age: "",
    gender: "",
    state: "",
    city: "",
    educationLevel: "10th"
  });
  const [success, setSuccess] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    console.log("SignupForm: Auth state changed, currentUser:", currentUser);
    if (currentUser) {
      console.log("SignupForm: User is authenticated, redirecting to:", from);
      navigate(from);
    }
  }, [currentUser, navigate, from]);

  // Check for redirect result when component mounts
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        setIsLoading(true);
        
        // Check if we were expecting a Google sign-in
        const authInProgress = localStorage.getItem('googleAuthInProgress');
        const authStartTime = localStorage.getItem('googleAuthStartTime');
        
        console.log("Checking for Google sign-in redirect result...", { 
          authInProgress, 
          authStartTime,
          timeSinceStart: authStartTime ? (Date.now() - parseInt(authStartTime)) / 1000 + 's' : 'N/A'
        });

        // Get auth providers to check if Firebase is properly initialized
        console.log("Available auth providers:", auth.app.options);
        
        try {
          const result = await getRedirectResult(auth);
          console.log("Google redirect result:", result);
          
          if (result) {
            // Process the successful redirect result
            await processGoogleSignInResult(result);
          } else if (authInProgress) {
            console.warn("No Google redirect result found, but auth was in progress");
            const startTime = parseInt(authStartTime || '0');
            const timeElapsed = Date.now() - startTime;
            
            // If it's been less than 3 minutes, it could still be in progress
            if (timeElapsed < 180000) {
              console.log("Auth still in progress, waiting...");
            } else {
              // Auth has likely failed
              console.error("Google auth timed out after", timeElapsed / 1000, "seconds");
              toast.error("Google sign-in timed out. Please try again.");
              localStorage.removeItem('googleAuthInProgress');
              localStorage.removeItem('googleAuthStartTime');
            }
          } else {
            console.log("No Google redirect result found, normal page load");
          }
        } catch (redirectError) {
          console.error("Error getting redirect result:", redirectError);
          toast.error("Failed to complete Google sign-in: " + redirectError.message);
          localStorage.removeItem('googleAuthInProgress');
          localStorage.removeItem('googleAuthStartTime');
        }
      } catch (error) {
        console.error("Redirect sign-in error:", error);
        if (error.code === 'auth/operation-not-allowed') {
          toast.error("Google sign-in is not enabled in Firebase. Please contact support.");
        } else if (error.code && error.code !== 'auth/redirect-cancelled-by-user') {
          toast.error(error.message || "Failed to sign in with Google. Please try again.");
        }
        localStorage.removeItem('googleAuthInProgress');
        localStorage.removeItem('googleAuthStartTime');
      } finally {
        setIsLoading(false);
      }
    };

    if (!currentUser) {
      checkRedirectResult();
    }
  }, [navigate, from, currentUser]);  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Only create Firebase Auth user here
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);

      // Send OTP using our helper function
      console.log("Sending signup OTP to:", formData.email);
      
      try {
        const result = await sendSignupOtpFunction(formData.email);
        console.log("Signup OTP send result:", result);
        
        if (result && result.success) {
          toast.success("OTP sent to your email");
          navigate("/verify-otp", {
            state: {
              email: formData.email,
              mode: "register",
              userData: formData,
            },
          });
        } else {
          throw new Error("Failed to send OTP: " + (result.error || "Unknown error"));
        }
      } catch (otpError) {
        console.error("OTP send error:", otpError);
        toast.error("Failed to send OTP: " + (otpError.message || "Unknown error"));
        setIsLoading(false);
      }
    } catch (error) {
      toast.error(error.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      toast.info("Starting Google sign-in...");
      
      // Configure Google provider with additional settings
      const provider = new GoogleAuthProvider();
      
      // Add scopes for better user information
      provider.addScope('profile');
      provider.addScope('email');
      
      // Set custom parameters to force account selection
      provider.setCustomParameters({
        prompt: 'select_account',
        client_id: '948814752784-3son1qfpo12ffv40b6r95os22ededg1e.apps.googleusercontent.com'
      });
      
      console.log("Starting Google sign-in with enhanced mode...");
      
      // Track that we're attempting Google auth
      localStorage.setItem('googleAuthInProgress', 'true');
      localStorage.setItem('googleAuthStartTime', Date.now().toString());
      
      try {
        // Try popup first (more reliable on desktop)
        const { signInWithPopup } = await import('firebase/auth');
        const result = await signInWithPopup(auth, provider);
        console.log("Google sign-in popup successful:", result.user.email);
        await processGoogleSignInResult(result);
      } catch (popupError) {
        console.error("Popup error:", popupError);
        
        // Only fallback to redirect for specific errors
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.code === 'auth/popup-closed-by-user' ||
            popupError.code === 'auth/cancelled-popup-request') {
          
          console.log("Popup blocked or closed, falling back to redirect...");
          toast.info("Using alternative sign-in method...");
          
          try {
            await signInWithRedirect(auth, provider);
            // The page will reload after redirect
            console.log("Redirect initiated...");
          } catch (redirectError) {
            console.error("Redirect error:", redirectError);
            toast.error("Failed to start Google sign-in. Please try again.");
            localStorage.removeItem('googleAuthInProgress');
            localStorage.removeItem('googleAuthStartTime');
            setIsLoading(false);
          }
        } else {
          // Handle other errors
          console.error("Google sign-in error:", popupError);
          toast.error(popupError.message || "Failed to sign in with Google");
          localStorage.removeItem('googleAuthInProgress');
          localStorage.removeItem('googleAuthStartTime');
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error("Google sign-up error:", error);
      toast.error("Failed to sign up with Google. Please try again.");
      localStorage.removeItem('googleAuthInProgress');
      localStorage.removeItem('googleAuthStartTime');
      setIsLoading(false);
    }
  };
  
  // Process the Google sign-in result (used by both popup and redirect)
  const processGoogleSignInResult = async (result) => {
    try {
      if (!result || !result.user) {
        throw new Error("No user data received from Google");
      }
      
      const user = result.user;
      console.log("Processing Google user:", user.email);
      
      // Clear auth flags
      localStorage.removeItem('googleAuthInProgress');
      localStorage.removeItem('googleAuthStartTime');
      
      // Save Google user data for backup/recovery
      const googleUserData = {
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        photoURL: user.photoURL,
        uid: user.uid,
        providerId: 'google.com'
      };
      localStorage.setItem('googleUserData', JSON.stringify(googleUserData));
      
      // Check if user already exists in Firestore
      console.log("Checking if user exists in Firestore...");
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (!userDoc.exists()) {
        console.log("New Google user, sending to OTP verification...");
        
        // Try both - directly set document AND go to OTP verification
        // This ensures the user is created even if they don't complete OTP
        await setDoc(doc(db, "users", user.uid), {
          ...googleUserData,
          createdAt: new Date().toISOString(),
          verifiedByOtp: false, // Will be updated after OTP verification
          verificationPending: true
        });
        
        // Store data for OTP verification
        localStorage.setItem('pendingOtpEmail', user.email);
        
        // Try to send OTP
        try {
          const otpResult = await sendSignupOtpFunction(user.email);
          console.log("OTP send result:", otpResult);
          
          if (otpResult && otpResult.success) {
            toast.success("Verification code sent to your email");
            
            // Navigate to OTP verification using safe navigation
            safeNavigate(navigate, "/verify-otp", {
              email: user.email,
              mode: "google-register",
              userData: googleUserData,
            });
            
            // Return early to avoid redirection to dashboard
            return;
          } else {
            console.warn("OTP sending failed, but continuing with account creation");
            toast.warning("Could not send verification code, but your account was created");
          }
        } catch (otpError) {
          console.error("Error sending OTP:", otpError);
          toast.warning("Could not verify email, but your account was created");
        }
        
        // If we're here, OTP failed but we still created the user
        // Even if OTP fails, we should still redirect to the verification page
        // so the user can try again or skip verification
        toast.info("Redirecting to verification page...");
        safeNavigate(navigate, "/verify-otp", {
          email: user.email,
          mode: "google-register",
          userData: googleUserData,
        });
      } else {
        console.log("Existing Google user, checking verification status");
        const userData = userDoc.data();
        
        if (userData.verifiedByOtp === true) {
          // User is already verified
          toast.success("Signed in successfully with Google!");
          navigate("/dashboard");
        } else {
          // User exists but needs verification
          toast.info("Please complete verification");
          safeNavigate(navigate, "/verify-otp", {
            email: user.email,
            mode: "google-register",
            userData: googleUserData,
          });
        }
      }
    } catch (error) {
      console.error("Error processing Google sign-in:", error);
      toast.error("Failed to process Google sign-in: " + error.message);
      setIsLoading(false);
    }
  };
  
  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { 
        type: "spring" as const, 
        bounce: 0.25, 
        duration: 0.8 
      } 
    }
  };
  const fieldVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0, 
      transition: { 
        delay: i * 0.08, 
        duration: 0.5 
      } 
    })
  };

  return (
    <div className="relative flex justify-center items-center min-h-[80vh]">
      {/* Animated SVG Blobs */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.18, scale: 1 }}
        transition={{ duration: 1.2 }}
        className="absolute -top-32 -left-32 w-[400px] h-[400px] z-0 pointer-events-none select-none"
      >
        <svg width="400" height="400" viewBox="0 0 400 400" fill="none">
          <defs>
            <radialGradient id="signupBlob1" cx="50%" cy="50%" r="80%">
              <stop offset="0%" stopColor="#4f8cff" />
              <stop offset="100%" stopColor="#a0e9ff" />
            </radialGradient>
          </defs>
          <motion.path 
            d="M340,60Q400,120,340,180Q280,240,180,220Q80,200,100,120Q120,40,220,40Q320,40,340,60Z" 
            fill="url(#signupBlob1)" 
            animate={{ 
              d: 'M340,60Q400,120,340,180Q280,240,180,220Q80,200,100,120Q120,40,220,40Q320,40,340,60Z'
            }} 
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', type: 'tween' }} 
          />
        </svg>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 0.13, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.3 }}
        className="absolute -bottom-32 -right-32 w-[340px] h-[340px] z-0 pointer-events-none select-none"
      >
        <svg width="340" height="340" viewBox="0 0 340 340" fill="none">
          <defs>
            <radialGradient id="signupBlob2" cx="50%" cy="50%" r="80%">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#f3e8ff" />
            </radialGradient>
          </defs>
          <motion.path 
            d="M170,60Q240,120,200,200Q160,280,80,220Q0,160,60,80Q120,0,170,60Z" 
            fill="url(#signupBlob2)" 
            animate={{ 
              d: 'M170,60Q240,120,200,200Q160,280,80,220Q0,160,60,80Q120,0,170,60Z'
            }} 
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', type: 'tween' }} 
          />
        </svg>
      </motion.div>
      {/* Animated Card */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-md w-full p-8 bg-white/70 backdrop-blur-lg border border-white/30 rounded-3xl shadow-2xl flex flex-col items-center"
      >
        {/* Progress Bar */}
        <motion.div className="w-full mb-6">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: success ? "100%" : "90%" }}
            transition={{ duration: 0.7, type: "spring", bounce: 0.3 }}
            className="h-2 rounded-full bg-gradient-to-r from-education-primary to-education-secondary shadow-inner"
          />
        </motion.div>
        {/* Animated Icon or Confetti on Success */}
        <AnimatePresence>
          {success ? (
            <motion.div
              key="success"
              initial={{ scale: 0, rotate: -30, opacity: 0 }}
              animate={{ scale: 1.1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.7 }}
              className="mb-4 flex items-center justify-center"
            >
              <CheckCircle className="h-16 w-16 text-education-success drop-shadow-lg animate-bounce" />
            </motion.div>
          ) : (
            <motion.div
              key="signup"
              initial={{ scale: 0.7, rotate: -10, opacity: 0 }}
              animate={{ scale: 1, rotate: [0, 8, -8, 0], opacity: 1 }}
              transition={{ duration: 2, type: "tween", ease: "easeInOut", repeat: Infinity, repeatType: "loop", repeatDelay: 3 }}
              className="mb-4 flex items-center justify-center rounded-full bg-gradient-to-br from-education-primary/20 to-education-secondary/20 shadow-lg w-16 h-16"
            >
              <User className="h-9 w-9 text-education-primary" />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-education-primary to-education-secondary bg-clip-text text-transparent">Create Your Account</h1>
          <p className="text-muted-foreground mt-2">Sign up to get started with <span className="font-semibold text-education-primary">GUIDMENEXT</span></p>
        </div>
        <form className="space-y-4 w-full" onSubmit={handleSubmit}>
          {[
            { label: "First Name", name: "firstName", icon: <User />, type: "text", placeholder: "First name" },
            { label: "Last Name", name: "lastName", icon: <User />, type: "text", placeholder: "Last name" },
            { label: "Email", name: "email", icon: <Mail />, type: "email", placeholder: "Enter your email" },
            { label: "Phone Number", name: "phoneNumber", icon: <Phone />, type: "tel", placeholder: "Enter your phone number" },
            { label: "Age", name: "age", icon: <User />, type: "number", placeholder: "Enter your age" },
            { label: "Password", name: "password", icon: <Lock />, type: isPasswordVisible ? "text" : "password", placeholder: "Create a password", isPassword: true },
          ].map((field, i) => (
            <motion.div
              key={field.name}
              custom={i}
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
              className="space-y-1"
            >
              <label htmlFor={field.name} className="text-sm font-medium flex items-center gap-2">
                {field.icon}
                {field.label}
              </label>
              <div className="relative">
                <Input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  className="pl-10"
                  value={formData[field.name]}
                  onChange={handleChange}
                  required
                  disabled={isLoading || success}
                  onFocus={e => e.target.parentElement.classList.add('ring-2', 'ring-education-primary', 'scale-105')}
                  onBlur={e => e.target.parentElement.classList.remove('ring-2', 'ring-education-primary', 'scale-105')}
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground">
                  {field.isPassword ? (
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                      tabIndex={-1}
                      disabled={isLoading || success}
                    >
                      {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">{isPasswordVisible ? "Hide password" : "Show password"}</span>
                    </button>
                  ) : field.icon}
                </span>
              </div>
              {field.name === "password" && (
                <p className="text-xs text-muted-foreground mt-1">Password must be at least 8 characters long</p>
              )}
            </motion.div>
          ))}
          {/* Gender Selection */}
          <motion.div variants={fieldVariants} custom={4} initial="hidden" animate="visible" className="space-y-1">
            <label htmlFor="gender" className="text-sm font-medium flex items-center gap-2">
              <UserCheck /> Gender
            </label>
            <div className="relative">
              <select
                id="gender"
                name="gender"
                className="w-full pl-10 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-education-primary"
                value={formData.gender}
                onChange={handleChange}
                required
                disabled={isLoading || success}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground">
                <UserCheck />
              </span>
            </div>
          </motion.div>
          {/* State and City */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div variants={fieldVariants} custom={5} initial="hidden" animate="visible" className="space-y-1">
              <label htmlFor="state" className="text-sm font-medium flex items-center gap-2">
                <MapPin /> State
              </label>
              <div className="relative">
                <select
                  id="state"
                  name="state"
                  className="w-full pl-10 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-education-primary"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  disabled={isLoading || success}
                >
                  <option value="">Select State</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                  <option value="Assam">Assam</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Chhattisgarh">Chhattisgarh</option>
                  <option value="Goa">Goa</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Himachal Pradesh">Himachal Pradesh</option>
                  <option value="Jharkhand">Jharkhand</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Manipur">Manipur</option>
                  <option value="Meghalaya">Meghalaya</option>
                  <option value="Mizoram">Mizoram</option>
                  <option value="Nagaland">Nagaland</option>
                  <option value="Odisha">Odisha</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Sikkim">Sikkim</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Tripura">Tripura</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Uttarakhand">Uttarakhand</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                  <option value="Chandigarh">Chandigarh</option>
                  <option value="Dadra and Nagar Haveli">Dadra and Nagar Haveli</option>
                  <option value="Daman and Diu">Daman and Diu</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                  <option value="Ladakh">Ladakh</option>
                  <option value="Lakshadweep">Lakshadweep</option>
                  <option value="Puducherry">Puducherry</option>
                </select>
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground">
                  <MapPin />
                </span>
              </div>
            </motion.div>
            <motion.div variants={fieldVariants} custom={5} initial="hidden" animate="visible" className="space-y-1">
              <label htmlFor="city" className="text-sm font-medium flex items-center gap-2">
                <MapPin /> City
              </label>
              <div className="relative">
                <Input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="Enter your city"
                  className="pl-10"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  disabled={isLoading || success}
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground">
                  <MapPin />
                </span>
              </div>
            </motion.div>
          </div>
          {/* Education Level */}
          <motion.div variants={fieldVariants} custom={6} initial="hidden" animate="visible" className="space-y-1">
            <label htmlFor="educationLevel" className="text-sm font-medium flex items-center gap-2">
              <UserCheck /> Educational Level
            </label>
            <div className="relative">
              <select
                id="educationLevel"
                name="educationLevel"
                className="w-full pl-10 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-education-primary"
                value={formData.educationLevel}
                onChange={handleChange}
                required
                disabled={isLoading || success}
              >
                <option value="10th">10th</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Diploma">Diploma</option>
                <option value="B.A">B.A</option>
                <option value="B.Com">B.Com</option>
                <option value="B.Sc">B.Sc</option>
                <option value="B.Tech">B.Tech / B.E</option>
                <option value="MBBS">MBBS</option>
                <option value="B.Ed">B.Ed</option>
                <option value="D.El.Ed">D.El.Ed</option>
                <option value="BFA">BFA</option>
                <option value="B.Des">B.Des</option>
                <option value="LLB">LLB</option>
                <option value="M.A">M.A</option>
                <option value="M.Com">M.Com</option>
                <option value="M.Sc">M.Sc</option>
                <option value="M.Tech">M.Tech / M.E</option>
                <option value="MD">MD</option>
                <option value="MS">MS</option>
                <option value="MBA">MBA</option>
                <option value="Ph.D">Ph.D</option>
              </select>
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground">
                <UserCheck />
              </span>
            </div>
          </motion.div>
          {/* Terms Checkbox */}
          <motion.div variants={fieldVariants} custom={7} initial="hidden" animate="visible" className="flex items-center">
            <input
              type="checkbox"
              id="terms"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              required
              disabled={isLoading || success}
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-muted-foreground">
              I agree to the {" "}
              <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and {" "}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </label>
          </motion.div>
          {/* Submit Button */}
          <motion.div variants={fieldVariants} custom={8} initial="hidden" animate="visible">
            <Button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-education-primary to-education-secondary text-white font-bold text-lg shadow-lg hover:from-education-secondary hover:to-education-primary transition-all duration-200"
              disabled={isLoading || success}
            >
              {isLoading ? "Creating Account..." : success ? "Success!" : "Create Account"}
            </Button>
          </motion.div>
        </form>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative my-4"
        >
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white/70 backdrop-blur-lg px-2 text-muted-foreground">Or signup with</span>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button 
            type="button" 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2 bg-white/80 hover:bg-white/90"
            onClick={handleGoogleSignUp}
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66 2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign up with Google
          </Button>
        </motion.div>
        
        <AnimatePresence>
          {!success && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="text-center text-sm mt-6"
            >
              <span className="text-muted-foreground">Already have an account? </span>
              <Link to="/login" className="text-primary hover:underline">Sign in</Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
