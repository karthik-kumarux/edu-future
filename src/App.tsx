import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CollegeExplorer from "./pages/CollegeExplorer";
import Colleges from "./pages/Colleges";
import Events from "./pages/Events";
import Jobs from "./pages/Jobs";
import NotFound from "./pages/NotFound";
import Logout from "./pages/Logout";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import About from "./pages/About";
import Contact from "./pages/Contact";
import OtpVerification from "./pages/OtpVerification";

const queryClient = new QueryClient();

// Create a router with future flags enabled
const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/verify-otp",
    element: <OtpVerification />,
  },
  {
    path: "/register",
    element: <Signup />,
  },
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/contact",
    element: <Contact />,
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
  },
  {
    path: "/dashboard/explore",
    element: <ProtectedRoute><CollegeExplorer /></ProtectedRoute>,
  },
  {
    path: "/dashboard/profile",
    element: <ProtectedRoute><Profile /></ProtectedRoute>,
  },
  {
    path: "/dashboard/settings",
    element: <ProtectedRoute><Settings /></ProtectedRoute>,
  },
  {
    path: "/colleges",
    element: <ProtectedRoute><Colleges /></ProtectedRoute>,
  },
  {
    path: "/events",
    element: <ProtectedRoute><Events /></ProtectedRoute>,
  },
  {
    path: "/jobs",
    element: <ProtectedRoute><Jobs /></ProtectedRoute>,
  },
  {
    path: "/logout",
    element: <ProtectedRoute><Logout /></ProtectedRoute>,
  },
  {
    path: "/admin",
    element: <ProtectedRoute><Admin /></ProtectedRoute>,
  },
  {
    path: "*",
    element: <NotFound />,
  },
], {
  future: {
    // Use the latest v7 features
    v7_startTransition: true,
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <RouterProvider router={router} />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
