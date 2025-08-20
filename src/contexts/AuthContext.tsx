import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';

interface AuthContextType {
  currentUser: User | null;
  userProfile: any | null;
  isLoading: boolean;
  isVerified: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  // Function to fetch user profile data
  const fetchUserProfile = async (user: User) => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserProfile(userData);
        
        // Check if user is verified by OTP
        const isVerifiedByOtp = userData.verifiedByOtp === true;
        console.log("User verification status:", { 
          email: user.email, 
          isVerifiedByOtp, 
          verifiedByOtp: userData.verifiedByOtp 
        });
        
        setIsVerified(isVerifiedByOtp);
      } else {
        console.log("No user profile found for:", user.email);
        setIsVerified(false);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setIsVerified(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Save token to localStorage
        const token = await user.getIdToken();
        localStorage.setItem('token', token);
        
        // Fetch user profile
        await fetchUserProfile(user);
      } else {
        // Clear token and profile when signed out
        localStorage.removeItem('token');
        setUserProfile(null);
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sign out function
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      localStorage.removeItem('token');
      setUserProfile(null);
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  const value = {
    currentUser,
    userProfile,
    isLoading,
    isVerified,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}
