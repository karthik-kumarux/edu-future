import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

const Logout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Sign out from Firebase
        await signOut(auth);
        // Clear the token from localStorage
        localStorage.removeItem('token');
        
        toast({
          title: "Logged out successfully",
          description: "You have been logged out of your account",
          duration: 3000,
        });
        
        // Redirect to login page after logout
        navigate("/login");
      } catch (error) {
        console.error("Logout error:", error);
        toast({
          title: "Error",
          description: "Failed to log out. Please try again.",
          variant: "destructive",
          duration: 3000,
        });
      }
    };

    handleLogout();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-xl text-gray-600 mb-4">Logging you out...</p>
      </div>
    </div>
  );
};

export default Logout;
