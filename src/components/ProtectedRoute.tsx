import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireVerification?: boolean;
}

const ProtectedRoute = ({ children, requireVerification = true }: ProtectedRouteProps) => {
  const location = useLocation();
  const { currentUser, isLoading, isVerified } = useAuth();

  // Show loading state while determining auth status
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-education-primary"></div>
    </div>;
  }

  if (!currentUser) {
    // Redirect to login page if not authenticated
    // Pass the current location to redirect back after login
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Check verification status if required
  if (requireVerification && !isVerified) {
    // Get user email from localStorage as fallback
    const userEmail = localStorage.getItem('pendingOtpEmail') || currentUser.email;
    
    console.log("Protection check failed: User not verified", { 
      email: userEmail,
      location: location.pathname,
      isVerified
    });
    
    // Store redirect information in localStorage as a backup
    localStorage.setItem('redirectAfterVerification', location.pathname);
    
    // Redirect to OTP verification page if not verified
    return <Navigate to="/verify-otp" replace state={{ 
      email: userEmail,
      mode: currentUser.providerData[0]?.providerId === 'google.com' ? 'google-register' : 'register',
      redirectAfter: location.pathname,
      userData: {
        email: userEmail,
        uid: currentUser.uid
      }
    }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 