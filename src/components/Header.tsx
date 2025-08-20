import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Calendar, Menu, X, User } from "lucide-react";
import { useState, useEffect } from "react";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Colleges", to: "/colleges" },
  { label: "Events", to: "/events" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, [location.pathname]); // Re-check when route changes

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, type: 'spring', stiffness: 80 }}
      className="w-full flex justify-center absolute top-6 left-0 z-50 pointer-events-none"
    >
      <div className="pointer-events-auto w-full max-w-7xl mx-auto px-6 sm:px-10 rounded-2xl shadow-2xl bg-white/50 backdrop-blur-lg border-2 border-white/40 flex items-center justify-between h-16 gap-4 transition-all duration-300">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-2xl bg-gradient-to-r from-education-primary to-education-secondary bg-clip-text text-transparent drop-shadow-lg transition-transform duration-200 hover:scale-105">
          <img
                src="../gude.png"  // Replace with your image path
                alt="Logo"
                className="h-7 w-7 rounded-full object-cover"
              />
            <span className="ml-2">GUIDMENEXT</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 justify-center flex-1 min-w-0">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`font-medium text-muted-foreground hover:text-education-primary transition-colors duration-200 px-2 py-1 rounded-lg hover:bg-education-primary/10 focus:bg-education-primary/20 focus:outline-none focus:ring-2 focus:ring-education-primary/30 truncate ${location.pathname === link.to ? 'text-education-primary font-semibold' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          {isAuthenticated ? (
            <Link to="/dashboard" className="px-5 py-2 rounded-lg bg-education-primary text-white font-semibold shadow hover:bg-education-secondary transition-colors duration-200 hover:scale-105 active:scale-95 whitespace-nowrap flex items-center gap-2">
              <User className="h-4 w-4" />
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="px-5 py-2 rounded-lg bg-education-primary text-white font-semibold shadow hover:bg-education-secondary transition-colors duration-200 hover:scale-105 active:scale-95 whitespace-nowrap">
                Login
              </Link>
              <Link to="/register" className="px-5 py-2 rounded-lg border border-education-primary text-education-primary font-semibold bg-white shadow hover:bg-education-primary/10 transition-colors duration-200 hover:scale-105 active:scale-95 whitespace-nowrap">
                Register
              </Link>
            </>
          )}
        </div>
        <button className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors duration-200" onClick={() => setMobileMenuOpen(true)}>
          <Menu className="h-6 w-6 text-education-primary" />
        </button>
      </div>
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-0 z-50 bg-black/40 flex justify-end"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="w-64 bg-white h-full shadow-xl p-6 flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <Link to="/" className="flex items-center gap-2 font-extrabold text-xl bg-gradient-to-r from-education-primary to-education-secondary bg-clip-text text-transparent">
                <img
                src="../gude.png"  // Replace with your image path
                alt="Logo"
                className="h-7 w-7 rounded-full object-cover"
              />
            <span className="ml-2">GUIDMENEXT</span>
              </Link>
              <button className="p-2 rounded-lg hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-6 w-6 text-education-primary" />
              </button>
            </div>
            <nav className="flex flex-col gap-4">
              {navLinks.map(link => (
                <Link key={link.to} to={link.to} className="font-medium text-muted-foreground hover:text-education-primary transition-colors text-lg" onClick={() => setMobileMenuOpen(false)}>
                  {link.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <Link to="/dashboard" className="mt-4 px-5 py-2 rounded-lg bg-education-primary text-white font-semibold shadow hover:bg-education-secondary transition-colors text-center flex items-center justify-center gap-2">
                  <User className="h-4 w-4" />
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="mt-4 px-5 py-2 rounded-lg bg-education-primary text-white font-semibold shadow hover:bg-education-secondary transition-colors text-center">
                    Login
                  </Link>
                  <Link to="/register" className="mt-2 px-5 py-2 rounded-lg border border-education-primary text-education-primary font-semibold bg-white shadow hover:bg-education-primary/10 transition-colors text-center">
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
