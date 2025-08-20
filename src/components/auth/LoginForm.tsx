import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { auth, functions, db, sendLoginOtpFunction } from "@/lib/firebase";
import { signInWithEmailAndPassword, signInWithRedirect, GoogleAuthProvider, getRedirectResult } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "sonner";
import { httpsCallable } from "firebase/functions";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const from = location.state?.from || "/dashboard";
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (currentUser) {
      navigate(from);
    }
  }, [currentUser, navigate, from]);

  // Check for redirect result when component mounts
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        setIsLoading(true);
        const result = await getRedirectResult(auth);
        if (result) {
          // User successfully signed in after redirect
          const token = await result.user.getIdToken();
          
          // Check if this is a returning user (already verified)
          const userDoc = await getDoc(doc(db, "users", result.user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Check if user has completed OTP verification
            if (userData.verifiedByOtp === true) {
              // Existing verified user, proceed to dashboard
              toast.success(`Welcome back, ${result.user.displayName || 'user'}!`);
              
              // Navigate to the requested page or dashboard
              window.location.href = from === "/dashboard" ? "/dashboard" : from;
            } else {
              // User exists but not verified, redirect to OTP verification
              toast.info("Please complete email verification");
              navigate("/verify-otp", {
                state: {
                  email: result.user.email,
                  mode: "google-register",
                  userData: {
                    uid: result.user.uid,
                    email: result.user.email,
                    firstName: result.user.displayName?.split(' ')[0] || '',
                    lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
                    providerId: 'google.com'
                  },
                  redirectAfter: from
                }
              });
            }
          } else {
            // New Google user, needs to be processed in SignupForm
            // This might happen if user clicks "Sign in with Google" but doesn't have an account yet
            toast.info("Please complete the signup process");
            navigate("/register");
          }
        }
      } catch (error) {
        console.error("Redirect sign-in error:", error);
        if (error.code === 'auth/operation-not-allowed') {
          toast.error("Google sign-in is not enabled in Firebase. Please contact support.");
        } else if (error.code && error.code !== 'auth/redirect-cancelled-by-user') {
          toast.error(error.message || "Failed to sign in with Google. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (!currentUser) {
      checkRedirectResult();
    }
  }, [navigate, from, currentUser]);

  const handleChange = (e) => {
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
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('token', token);
      
      // Send OTP using our helper function
      console.log("Sending login OTP to:", formData.email);
      
      try {
        const result = await sendLoginOtpFunction(formData.email);
        console.log("Login OTP send result:", result);
        
        if (result && result.success) {
          toast.success("OTP sent to your email!");
          // Redirect to OTP verification page
          navigate("/verify-otp", { state: { email: formData.email, mode: "login" } });
        } else {
          throw new Error("Failed to send OTP: " + (result.error || "Unknown error"));
        }
      } catch (otpError) {
        console.error("OTP send error:", otpError);
        toast.error("Failed to send OTP: " + (otpError.message || "Unknown error"));
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to login. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
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
        prompt: 'select_account'
      });
      
      console.log("Starting Google sign-in...");
      
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
      console.error("Google sign-in error:", error);
      toast.error("Failed to sign in with Google. Please try again.");
      localStorage.removeItem('googleAuthInProgress');
      localStorage.removeItem('googleAuthStartTime');
      setIsLoading(false);
    }
  };
  
  // Process Google sign-in result
  const processGoogleSignInResult = async (result) => {
    try {
      if (!result || !result.user) {
        throw new Error("No user data received from Google");
      }
      
      // Clear auth flags
      localStorage.removeItem('googleAuthInProgress');
      localStorage.removeItem('googleAuthStartTime');
      
      const user = result.user;
      console.log("Processing Google sign-in for:", user.email);
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        if (userData.verifiedByOtp === true) {
          // User is verified, proceed to dashboard
          toast.success(`Welcome back, ${user.displayName || 'user'}!`);
          navigate(from);
        } else {
          // User exists but not verified, redirect to OTP verification
          toast.info("Please complete email verification");
          navigate("/verify-otp", {
            state: {
              email: user.email,
              mode: "google-register",
              userData: {
                uid: user.uid,
                email: user.email,
                firstName: user.displayName?.split(' ')[0] || '',
                lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
                providerId: 'google.com'
              },
              redirectAfter: from
            }
          });
        }
      } else {
        // New Google user, redirect to registration
        toast.info("Please complete the signup process");
        navigate("/register");
      }
    } catch (error) {
      console.error("Error processing Google sign-in result:", error);
      toast.error("Failed to process sign-in: " + error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-6 p-6 bg-card border border-border rounded-xl shadow-sm">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Welcome Back</h1>
        <p className="text-muted-foreground mt-2">Sign in to continue to your account</p>
      </div>
      
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              className="pl-10"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type={isPasswordVisible ? "text" : "password"}
              placeholder="Enter your password"
              className="pl-10 pr-10"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              disabled={isLoading}
            >
              {isPasswordVisible ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <span className="sr-only">
                {isPasswordVisible ? "Hide password" : "Show password"}
              </span>
            </button>
          </div>
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
      
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      
      <Button 
        type="button" 
        variant="outline" 
        className="w-full flex items-center justify-center gap-2"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66 2.84z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Sign in with Google
      </Button>
      
      <div className="text-center text-sm mt-4">
        <span className="text-muted-foreground">Don't have an account? </span>
        <Link to="/register" className="text-primary hover:underline">
          Register
        </Link>
      </div>
    </div>
  );
}
