import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowRight, Compass, GraduationCap, Calendar, MessageSquare, Menu, X, Wrench, Stethoscope, Briefcase, Palette, Gavel, Beaker, User } from "lucide-react";
import { doc, setDoc, collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

const features = [
  {
    icon: <Compass className="h-7 w-7 text-education-primary" />,
    title: "College Explorer",
    description: "Discover and compare colleges across India with smart filters and instant results."
  },
  {
    icon: <GraduationCap className="h-7 w-7 text-education-secondary" />,
    title: "Career Guidance",
    description: "Get personalized career paths and expert advice tailored to your interests."
  },
  {
    icon: <Calendar className="h-7 w-7 text-education-accent" />,
    title: "Event Calendar",
    description: "Never miss important college events, webinars, and deadlines."
  },
  {
    icon: <MessageSquare className="h-7 w-7 text-education-success" />,
    title: "AI Advisor",
    description: "Chat with our AI for instant answers to your education and career questions."
  }
];

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Colleges", to: "/colleges" },
  { label: "Events", to: "/events" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

const categories = [
  { icon: <Wrench className="h-8 w-8 text-education-primary" />, label: "Engineering" },
  { icon: <Stethoscope className="h-8 w-8 text-education-secondary" />, label: "Medical" },
  { icon: <Briefcase className="h-8 w-8 text-education-accent" />, label: "Business" },
  { icon: <Palette className="h-8 w-8 text-education-success" />, label: "Arts" },
  { icon: <Gavel className="h-8 w-8 text-education-error" />, label: "Law" },
  { icon: <Beaker className="h-8 w-8 text-education-warning" />, label: "Science" },
];

export default function Index() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [colleges, setColleges] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    // Fetch latest 4 colleges from Firestore
    async function fetchColleges() {
      const q = query(collection(db, "colleges"), orderBy("createdAt", "desc"), limit(4));
      const querySnapshot = await getDocs(q);
      const collegeList: any[] = [];
      querySnapshot.forEach((doc) => {
        collegeList.push({ id: doc.id, ...doc.data() });
      });
      setColleges(collegeList);
    }
    fetchColleges();

    // Fetch latest 4 jobs from Firestore
    async function fetchJobs() {
      const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"), limit(4));
      const querySnapshot = await getDocs(q);
      const jobList: any[] = [];
      querySnapshot.forEach((doc) => {
        jobList.push({ id: doc.id, ...doc.data() });
      });
      setJobs(jobList);
    }
    fetchJobs();
  }, []);

  // Book an Appointment submit handler
  async function handleBookAppointment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBookingLoading(true);
    setBookingSuccess(false);
    setBookingError("");
    const form = e.currentTarget;
    const data = {
      name: form.name.valueOf,
      email: form.email.value,
      phone: form.phone.value,
      datetime: form.datetime.value,
      message: form.message.value,
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, "appointments", `${data.email}_${Date.now()}`), data);
      setBookingSuccess(true);
      form.reset();
    } catch (err: any) {
      setBookingError("Something went wrong. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Modern Glassmorphic, Centered, Animated Navbar */}
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, type: 'spring', stiffness: 80 }}
        className="w-full flex justify-center fixed top-6 left-0 z-50 pointer-events-none"
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
                className="font-medium text-muted-foreground hover:text-education-primary transition-colors duration-200 px-2 py-1 rounded-lg hover:bg-education-primary/10 focus:bg-education-primary/20 focus:outline-none focus:ring-2 focus:ring-education-primary/30 truncate"
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
      </motion.nav>
      {/* Mobile Menu (unchanged) */}
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

      {/* Hero Section with Enhanced Background and Effects */}
      <section className="relative flex flex-col items-center justify-center text-center min-h-screen w-full overflow-hidden">
        {/* Animated SVG Blobs for Depth */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.18, scale: 1 }}
          transition={{ duration: 1.2, type: 'spring', bounce: 0.2 }}
          aria-hidden="true"
          className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none select-none"
        >
          <svg width="480" height="340" viewBox="0 0 480 340" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="heroBlobGradient" cx="50%" cy="50%" r="80%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#4f8cff" />
                <stop offset="100%" stopColor="#a0e9ff" />
              </radialGradient>
            </defs>
            <motion.path
              d="M340,60Q400,120,340,180Q280,240,180,220Q80,200,100,120Q120,40,220,40Q320,40,340,60Z"
              fill="url(#heroBlobGradient)"
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
          transition={{ duration: 1.7, delay: 0.6, type: 'spring', bounce: 0.2 }}
          aria-hidden="true"
          className="absolute -top-24 -right-28 z-0 pointer-events-none select-none"
        >
          <svg width="260" height="260" viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="heroTealGradient" cx="50%" cy="50%" r="80%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#5eead4" />
                <stop offset="100%" stopColor="#e0fff9" />
              </radialGradient>
            </defs>
            <motion.path
              d="M130,40Q180,80,160,130Q140,180,80,160Q20,140,40,80Q60,20,130,40Z"
              fill="url(#heroTealGradient)"
              animate={{
                d: 'M130,40Q180,80,160,130Q140,180,80,160Q20,140,40,80Q60,20,130,40Z'
              }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', type: 'tween' }}
            />
          </svg>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 0.12, scale: 1 }}
          transition={{ duration: 1.7, delay: 0.8, type: 'spring', bounce: 0.2 }}
          aria-hidden="true"
          className="absolute -bottom-24 -left-28 z-0 pointer-events-none select-none"
        >
          <svg width="260" height="260" viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="heroPurpleGradient" cx="50%" cy="50%" r="80%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#f3e8ff" />
              </radialGradient>
            </defs>
            <motion.path
              d="M130,60Q180,100,160,170Q140,240,80,200Q20,160,60,100Q100,40,130,60Z"
              fill="url(#heroPurpleGradient)"
              animate={{
                d: 'M130,60Q180,100,160,170Q140,240,80,200Q20,160,60,100Q100,40,130,60Z'
              }}
              transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', type: 'tween' }}
            />
          </svg>
        </motion.div>
        {/* Gradient Background Layer */}
        <div className="absolute inset-0 w-full h-full z-0 bg-gradient-to-br from-education-primary/90 to-education-secondary/90" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-4">
          {/* Animated hero text and buttons */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.18 } }
            }}
            className="flex flex-col items-center"
          >
            <motion.h1
              variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl font-extrabold mb-6 text-white drop-shadow-lg"
              style={{ textShadow: '0 4px 24px rgba(0,0,0,0.18)' }}
            >
              Welcome to GUIDMENEXT
            </motion.h1>
            <motion.p
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl mx-auto text-lg md:text-2xl text-white mb-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.10)]"
            >
              Your next-generation platform for college discovery, career guidance, and educational empowerment.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.7 }}
              >
                <Link to="/colleges" className="inline-flex items-center px-8 py-3 rounded-xl bg-gradient-to-r from-education-primary to-education-secondary text-white font-semibold text-lg shadow-lg hover:bg-education-secondary hover:scale-105 focus:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-education-primary/40">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </motion.div>
              {isAuthenticated && (
                <motion.div
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.7, delay: 0.15 }}
                >
                  <Link to="/dashboard" className="inline-flex items-center px-8 py-3 rounded-xl border border-education-primary text-education-primary font-semibold text-lg bg-white shadow hover:bg-education-primary/10 hover:scale-105 focus:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-education-primary/40">
                    My Dashboard
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </div>
        {/* Scroll Down Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.2, delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
        >
          <span className="animate-bounce text-white/80">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M12 5v14m0 0l-7-7m7 7l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
          <span className="text-xs text-white/70 mt-1">Scroll Down</span>
        </motion.div>
      </section>

      {/* Explore Categories Section (move up) */}
      <section className="py-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
          className="container mx-auto flex flex-col items-center"
        >
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-2xl md:text-3xl font-bold mb-10 text-center"
          >
            Explore Categories
          </motion.h2>
          <div className="flex flex-wrap justify-center gap-8">
            {categories.map((cat, idx) => (
              <motion.div
                key={cat.label}
                variants={{ hidden: { opacity: 0, scale: 0.8, y: 40 }, visible: { opacity: 1, scale: 1, y: 0 } }}
                transition={{ duration: 0.7, type: "spring", bounce: 0.3, delay: idx * 0.05 }}
                whileHover={{ scale: 1.12, boxShadow: "0 8px 32px 0 rgba(0,0,0,0.12)" }}
                className="flex flex-col items-center"
              >
                <div className="rounded-full bg-white shadow-lg border border-border w-20 h-20 flex items-center justify-center mb-3 transition-all">
                  {cat.icon}
                </div>
                <span className="text-base font-medium text-muted-foreground mt-1">{cat.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features Section (move up) */}
      <section className="py-20 px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
          className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.7, type: "spring", bounce: 0.3 }}
              className="bg-white rounded-2xl p-8 shadow-xl border border-border hover:shadow-2xl hover:scale-[1.04] transition-all duration-300 group relative overflow-hidden"
            >
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-education-primary/10 to-education-secondary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-education-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground mb-5 min-h-[56px]">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="container mx-auto bg-gradient-to-r from-education-primary/90 to-education-secondary/90 rounded-3xl py-14 px-6 md:px-16 flex flex-col items-center text-center shadow-2xl"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 drop-shadow-lg">Ready to shape your future?</h2>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl">
            Join GUIDMENEXT and unlock a world of opportunities, guidance, and success. Start your journey today!
          </p>
          <Link to="/colleges" className="inline-flex items-center px-10 py-4 rounded-xl bg-white text-education-primary font-bold text-lg shadow-lg hover:bg-education-primary/10 transition-colors">
            Explore Colleges <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </motion.div>
      </section>

      {/* Single Horizontal Scrolling Section */}
      <section className="py-8 px-4 overflow-hidden bg-education-primary">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="container mx-auto"
        >
          <motion.div 
            className="flex gap-4 pb-2"
            animate={{
              x: [0, -700],
            }}
            transition={{
              x: {
                duration: 18,
                repeat: Infinity,
                repeatType: "loop",
                ease: "linear",
              },
            }}
          >
            {/* First Set */}
            <motion.div
              whileHover={{ scale: 1.07, y: -5 }}
              className="flex-shrink-0 w-36 h-12 bg-white/20 backdrop-blur-md rounded-xl shadow-lg p-3 border border-white/30 hover:shadow-2xl transition-all duration-300 flex items-center justify-center"
            >
              <h3 className="text-base font-extrabold text-center text-white tracking-wide select-none whitespace-nowrap">Guidmenext</h3>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.07, y: -5 }}
              className="flex-shrink-0 w-36 h-12 bg-white/20 backdrop-blur-md rounded-xl shadow-lg p-3 border border-white/30 hover:shadow-2xl transition-all duration-300 flex items-center justify-center"
            >
              <h3 className="text-base font-extrabold text-center text-white tracking-wide select-none whitespace-nowrap">Part-time Jobs</h3>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.07, y: -5 }}
              className="flex-shrink-0 w-36 h-12 bg-white/20 backdrop-blur-md rounded-xl shadow-lg p-3 border border-white/30 hover:shadow-2xl transition-all duration-300 flex items-center justify-center"
            >
              <h3 className="text-base font-extrabold text-center text-white tracking-wide select-none whitespace-nowrap">Jobs</h3>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.07, y: -5 }}
              className="flex-shrink-0 w-36 h-12 bg-white/20 backdrop-blur-md rounded-xl shadow-lg p-3 border border-white/30 hover:shadow-2xl transition-all duration-300 flex items-center justify-center"
            >
              <h3 className="text-base font-extrabold text-center text-white tracking-wide select-none whitespace-nowrap">Events</h3>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.07, y: -5 }}
              className="flex-shrink-0 w-60 h-12 bg-white/20 backdrop-blur-md rounded-xl shadow-lg p-3 border border-white/30 hover:shadow-2xl transition-all duration-300 flex items-center justify-center"
            >
              <h3 className="text-base font-extrabold text-center text-white tracking-wide select-none whitespace-nowrap">Help me to pick the college</h3>
            </motion.div>
            {/* Duplicate Set for Seamless Loop */}
            <motion.div
              whileHover={{ scale: 1.07, y: -5 }}
              className="flex-shrink-0 w-36 h-12 bg-white/20 backdrop-blur-md rounded-xl shadow-lg p-3 border border-white/30 hover:shadow-2xl transition-all duration-300 flex items-center justify-center"
            >
              <h3 className="text-base font-extrabold text-center text-white tracking-wide select-none whitespace-nowrap">Guidmenext</h3>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.07, y: -5 }}
              className="flex-shrink-0 w-36 h-12 bg-white/20 backdrop-blur-md rounded-xl shadow-lg p-3 border border-white/30 hover:shadow-2xl transition-all duration-300 flex items-center justify-center"
            >
              <h3 className="text-base font-extrabold text-center text-white tracking-wide select-none whitespace-nowrap">Part-time Jobs</h3>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.07, y: -5 }}
              className="flex-shrink-0 w-36 h-12 bg-white/20 backdrop-blur-md rounded-xl shadow-lg p-3 border border-white/30 hover:shadow-2xl transition-all duration-300 flex items-center justify-center"
            >
              <h3 className="text-base font-extrabold text-center text-white tracking-wide select-none whitespace-nowrap">Jobs</h3>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.07, y: -5 }}
              className="flex-shrink-0 w-36 h-12 bg-white/20 backdrop-blur-md rounded-xl shadow-lg p-3 border border-white/30 hover:shadow-2xl transition-all duration-300 flex items-center justify-center"
            >
              <h3 className="text-base font-extrabold text-center text-white tracking-wide select-none whitespace-nowrap">Events</h3>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.07, y: -5 }}
              className="flex-shrink-0 w-60 h-12 bg-white/20 backdrop-blur-md rounded-xl shadow-lg p-3 border border-white/30 hover:shadow-2xl transition-all duration-300 flex items-center justify-center"
            >
              <h3 className="text-base font-extrabold text-center text-white tracking-wide select-none whitespace-nowrap">Help me to pick the college</h3>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Latest College Admissions Section */}
      <section className="py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="container mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center bg-gradient-to-r from-education-primary to-education-secondary bg-clip-text text-transparent">
            Latest College Admissions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {colleges.map((college) => (
              <motion.div
                key={college.id}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col min-h-[320px]"
              >
                <div className="relative h-40 w-full overflow-hidden">
                  {Array.isArray(college.images) && college.images.length > 0 ? (
                    <img
                      src={college.images[0]}
                      alt={college.name}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="p-6 flex flex-col flex-1 justify-between">
                  <h3 className="text-xl font-bold text-gray-800">{college.name}</h3>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center mt-8"
          >
            <Link
              to={isAuthenticated ? "/colleges" : "/register"}
              className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-education-primary to-education-secondary text-white font-semibold shadow-lg hover:from-education-secondary hover:to-education-primary transition-all duration-200"
            >
              See All Colleges
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Latest Jobs Section */}
      <section className="py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="container mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center bg-gradient-to-r from-education-primary to-education-secondary bg-clip-text text-transparent">
            Latest Jobs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {jobs.map((job) => (
              <motion.div
                key={job.id}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col min-h-[320px]"
              >
                {Array.isArray(job.images) && job.images.length > 0 && (
                  <div className="relative h-40 w-full overflow-hidden">
                    <img
                      src={job.images[0]}
                      alt={job.title || job.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                )}
                <div className="p-6 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{job.title || job.name}</h3>
                    <div className="text-sm text-gray-600 mb-2">{job.company}</div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {job.location && <span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-700">{job.location}</span>}
                      {job.type && <span className="px-2 py-1 bg-blue-100 rounded text-xs text-blue-700">{job.type}</span>}
                      {job.salary && <span className="px-2 py-1 bg-green-100 rounded text-xs text-green-700">{job.salary}</span>}
                    </div>
                  </div>
                  {job.lastDateToApply && (
                    <div className="mt-4 text-xs text-slate-500">Apply by: <span className="font-semibold">{job.lastDateToApply}</span></div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center mt-8"
          >
            <Link
              to={isAuthenticated ? "/jobs" : "/register"}
              className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-education-primary to-education-secondary text-white font-semibold shadow-lg hover:from-education-secondary hover:to-education-primary transition-all duration-200"
            >
              See All Jobs
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Book an Appointment Section (at the end) */}
      <section className="py-16 px-4 flex justify-center items-center relative overflow-hidden">
        {/* Animated SVG Blob Backgrounds - Multiple Layers */}
        {/* Main Blue Blob (center) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 0.22, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, type: 'spring', bounce: 0.2 }}
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none select-none"
        >
          <svg width="480" height="340" viewBox="0 0 480 340" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="blobGradient" cx="50%" cy="50%" r="80%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#4f8cff" />
                <stop offset="100%" stopColor="#a0e9ff" />
              </radialGradient>
            </defs>
            <motion.path
              d="M340,60Q400,120,340,180Q280,240,180,220Q80,200,100,120Q120,40,220,40Q320,40,340,60Z"
              fill="url(#blobGradient)"
              animate={{
                d: 'M340,60Q400,120,340,180Q280,240,180,220Q80,200,100,120Q120,40,220,40Q320,40,340,60Z'
              }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', type: 'tween' }}
            />
          </svg>
        </motion.div>
        {/* Pink Blob (top-left) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          whileInView={{ opacity: 0.18, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 0.2, type: 'spring', bounce: 0.2 }}
          aria-hidden="true"
          className="absolute -top-32 -left-32 z-0 pointer-events-none select-none"
        >
          <svg width="340" height="340" viewBox="0 0 340 340" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="pinkGradient" cx="50%" cy="50%" r="80%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#ff6fcb" />
                <stop offset="100%" stopColor="#ffe0f7" />
              </radialGradient>
            </defs>
            <motion.path
              d="M170,40Q220,80,200,170Q180,260,90,220Q0,180,40,90Q80,0,170,40Z"
              fill="url(#pinkGradient)"
              animate={{
                d: 'M170,40Q220,80,200,170Q180,260,90,220Q0,180,40,90Q80,0,170,40Z'
              }}
              transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', type: 'tween' }}
            />
          </svg>
        </motion.div>
        {/* Yellow Blob (bottom-right) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          whileInView={{ opacity: 0.15, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 0.4, type: 'spring', bounce: 0.2 }}
          aria-hidden="true"
          className="absolute -bottom-32 -right-32 z-0 pointer-events-none select-none"
        >
          <svg width="340" height="340" viewBox="0 0 340 340" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="yellowGradient" cx="50%" cy="50%" r="80%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#ffe066" />
                <stop offset="100%" stopColor="#fffbe0" />
              </radialGradient>
            </defs>
            <motion.path
              d="M170,60Q240,120,200,200Q160,280,80,220Q0,160,60,80Q120,0,170,60Z"
              fill="url(#yellowGradient)"
              animate={{
                d: 'M170,60Q240,120,200,200Q160,280,80,220Q0,160,60,80Q120,0,170,60Z'
              }}
              transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', type: 'tween' }}
            />
          </svg>
        </motion.div>
        {/* Teal Blob (top-right) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          whileInView={{ opacity: 0.13, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.7, delay: 0.6, type: 'spring', bounce: 0.2 }}
          aria-hidden="true"
          className="absolute -top-24 -right-28 z-0 pointer-events-none select-none"
        >
          <svg width="260" height="260" viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="tealGradient" cx="50%" cy="50%" r="80%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#5eead4" />
                <stop offset="100%" stopColor="#e0fff9" />
              </radialGradient>
            </defs>
            <motion.path
              d="M130,40Q180,80,160,130Q140,180,80,160Q20,140,40,80Q60,20,130,40Z"
              fill="url(#tealGradient)"
              animate={{
                d: 'M130,40Q180,80,160,130Q140,180,80,160Q20,140,40,80Q60,20,130,40Z'
              }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', type: 'tween' }}
            />
          </svg>
        </motion.div>
        {/* Purple Blob (bottom-left) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          whileInView={{ opacity: 0.12, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.7, delay: 0.8, type: 'spring', bounce: 0.2 }}
          aria-hidden="true"
          className="absolute -bottom-24 -left-28 z-0 pointer-events-none select-none"
        >
          <svg width="260" height="260" viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="purpleGradient" cx="50%" cy="50%" r="80%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#f3e8ff" />
              </radialGradient>
            </defs>
            <motion.path
              d="M130,60Q180,100,160,170Q140,240,80,200Q20,160,60,100Q100,40,130,60Z"
              fill="url(#purpleGradient)"
              animate={{
                d: 'M130,60Q180,100,160,170Q140,240,80,200Q20,160,60,100Q100,40,130,60Z'
              }}
              transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', type: 'tween' }}
            />
          </svg>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: 'spring', bounce: 0.25 }}
          className="w-full max-w-lg bg-white/60 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8 flex flex-col items-center relative overflow-hidden z-10"
        >
          {/* Animated Info Panel */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, type: 'spring', bounce: 0.3 }}
            className="w-full mb-4 flex flex-col items-center text-center"
          >
            <div className="flex items-center justify-center mb-2">
              <span className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-education-primary/20 to-education-secondary/20 w-10 h-10 mr-2">
                <MessageSquare className="h-6 w-6 text-education-primary" />
              </span>
              <span className="text-lg font-semibold text-education-primary">Book Your Free Guidance Session</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Schedule a personalized session with our expert advisors. Get answers, guidance, and support for your education or career journey—at your convenience!
            </p>
          </motion.div>
          {/* How it works checklist */}
          <motion.ul
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, type: 'spring', bounce: 0.2 }}
            className="w-full flex flex-col gap-2 mb-4"
          >
            <li className="flex items-center gap-2 text-sm text-foreground">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', bounce: 0.5 }}
                className="inline-flex items-center justify-center rounded-full bg-education-primary/20 w-6 h-6"
              >
                <Calendar className="h-4 w-4 text-education-primary" />
              </motion.span>
              Choose your preferred date & time
            </li>
            <li className="flex items-center gap-2 text-sm text-foreground">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: 'spring', bounce: 0.5 }}
                className="inline-flex items-center justify-center rounded-full bg-education-secondary/20 w-6 h-6"
              >
                <MessageSquare className="h-4 w-4 text-education-secondary" />
              </motion.span>
              Tell us your questions or goals
            </li>
            <li className="flex items-center gap-2 text-sm text-foreground">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: 'spring', bounce: 0.5 }}
                className="inline-flex items-center justify-center rounded-full bg-education-success/20 w-6 h-6"
              >
                <svg className="h-4 w-4 text-education-success" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </motion.span>
              Get expert advice & next steps
            </li>
          </motion.ul>
          {/* Animated Icon at Top */}
          <motion.div
            initial={{ scale: 0.7, rotate: -10, opacity: 0 }}
            animate={{ scale: 1, rotate: [0, 8, -8, 0], opacity: 1 }}
            transition={{
              duration: 2,
              type: 'tween',
              ease: 'easeInOut',
              repeat: Infinity,
              repeatType: 'loop',
              repeatDelay: 3
            }}
            className="mb-2 flex items-center justify-center rounded-full bg-gradient-to-br from-education-primary/20 to-education-secondary/20 shadow-lg w-16 h-16"
          >
            <Calendar className="h-9 w-9 text-education-primary" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-2xl md:text-3xl font-bold mb-6 text-center bg-gradient-to-r from-education-primary to-education-secondary bg-clip-text text-transparent"
          >
            Book an Appointment
          </motion.h2>
          <form className="w-full flex flex-col gap-5" onSubmit={handleBookAppointment}>
            {/* Name */}
            <motion.div whileFocus={{ scale: 1.03 }} className="relative">
              <input type="text" name="name" required placeholder=" " className="peer w-full px-4 py-3 rounded-xl border border-border bg-white/80 focus:bg-white focus:border-education-primary outline-none transition-all duration-200 shadow-sm" />
              <label className="absolute left-4 top-3 text-muted-foreground pointer-events-none transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-4 peer-focus:text-xs peer-focus:text-education-primary bg-white/80 px-1 rounded">
                Name
              </label>
            </motion.div>
            {/* Email */}
            <motion.div whileFocus={{ scale: 1.03 }} className="relative">
              <input type="email" name="email" required placeholder=" " className="peer w-full px-4 py-3 rounded-xl border border-border bg-white/80 focus:bg-white focus:border-education-primary outline-none transition-all duration-200 shadow-sm" />
              <label className="absolute left-4 top-3 text-muted-foreground pointer-events-none transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-4 peer-focus:text-xs peer-focus:text-education-primary bg-white/80 px-1 rounded">
                Email
              </label>
            </motion.div>
            {/* Phone */}
            <motion.div whileFocus={{ scale: 1.03 }} className="relative">
              <input type="tel" name="phone" required placeholder=" " className="peer w-full px-4 py-3 rounded-xl border border-border bg-white/80 focus:bg-white focus:border-education-primary outline-none transition-all duration-200 shadow-sm" />
              <label className="absolute left-4 top-3 text-muted-foreground pointer-events-none transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-4 peer-focus:text-xs peer-focus:text-education-primary bg-white/80 px-1 rounded">
                Phone
              </label>
            </motion.div>
            {/* Date & Time */}
            <motion.div whileFocus={{ scale: 1.03 }} className="relative">
              <input type="datetime-local" name="datetime" required placeholder=" " className="peer w-full px-4 py-3 rounded-xl border border-border bg-white/80 focus:bg-white focus:border-education-primary outline-none transition-all duration-200 shadow-sm" />
              <label className="absolute left-4 top-3 text-muted-foreground pointer-events-none transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-4 peer-focus:text-xs peer-focus:text-education-primary bg-white/80 px-1 rounded">
                Appointment Date & Time
              </label>
            </motion.div>
            {/* Message */}
            <motion.div whileFocus={{ scale: 1.03 }} className="relative">
              <textarea name="message" required placeholder=" " rows={3} className="peer w-full px-4 py-3 rounded-xl border border-border bg-white/80 focus:bg-white focus:border-education-primary outline-none transition-all duration-200 shadow-sm resize-none" />
              <label className="absolute left-4 top-3 text-muted-foreground pointer-events-none transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-4 peer-focus:text-xs peer-focus:text-education-primary bg-white/80 px-1 rounded">
                Message / Reason
              </label>
            </motion.div>
            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="mt-2 w-full py-3 rounded-xl bg-gradient-to-r from-education-primary to-education-secondary text-white font-bold text-lg shadow-lg hover:from-education-secondary hover:to-education-primary transition-all duration-200"
              disabled={bookingLoading}
            >
              {bookingLoading ? "Booking..." : "Book Appointment"}
            </motion.button>
            {bookingSuccess && (
              <div className="text-green-600 text-center font-semibold mt-2">Appointment booked successfully!</div>
            )}
            {bookingError && (
              <div className="text-red-600 text-center font-semibold mt-2">{bookingError}</div>
            )}
          </form>
        </motion.div>
      </section>

      {/* Animated Modern Footer */}
      <footer className="relative mt-12 overflow-x-hidden">
        {/* Footer Content - Grid/Flex Layout, Staggered Animation */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } }
          }}
          className="relative z-10 container mx-auto px-4 py-14 grid grid-cols-1 md:grid-cols-3 gap-10 items-center"
        >
          {/* Branding */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col items-center md:items-start gap-2"
          >
            <Link to="/" className="flex items-center gap-2 font-extrabold text-2xl bg-gradient-to-r from-education-primary to-education-secondary bg-clip-text text-transparent">
              <img
                src="../gude.png"  // Replace with your image path
                alt="Logo"
                className="h-7 w-7 rounded-full object-cover"
              />
<span className="ml-2">GUIDMENEXT</span>

            </Link>
            <span className="text-muted-foreground text-sm">Empowering your future, every step of the way.</span>
          </motion.div>
          {/* Navigation Links */}
          <motion.nav
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex flex-wrap gap-6 items-center justify-center"
          >
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} className="font-medium text-muted-foreground hover:text-education-primary transition-colors text-base">
                {link.label}
              </Link>
            ))}
          </motion.nav>
          {/* Social Icons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex gap-4 items-center justify-center"
          >
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="rounded-full p-2 bg-white/70 hover:bg-education-primary/20 transition-colors shadow">
              <svg className="h-6 w-6 text-education-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0022.4.36a9.09 9.09 0 01-2.88 1.1A4.52 4.52 0 0016.11 0c-2.5 0-4.52 2.02-4.52 4.52 0 .35.04.7.11 1.03C7.69 5.4 4.07 3.7 1.64 1.15c-.38.65-.6 1.4-.6 2.2 0 1.52.77 2.86 1.94 3.65A4.48 4.48 0 01.96 6v.06c0 2.13 1.52 3.9 3.54 4.3-.37.1-.76.16-1.16.16-.28 0-.55-.03-.81-.08.55 1.7 2.16 2.94 4.07 2.97A9.05 9.05 0 010 21.54a12.8 12.8 0 006.92 2.03c8.3 0 12.85-6.88 12.85-12.85 0-.2 0-.39-.01-.58A9.22 9.22 0 0023 3z"></path></svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="rounded-full p-2 bg-white/70 hover:bg-education-primary/20 transition-colors shadow">
              <svg className="h-6 w-6 text-education-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 2h-3a6 6 0 00-6 6v3H5v4h4v8h4v-8h3l1-4h-4V8a2 2 0 012-2h2z"></path></svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="rounded-full p-2 bg-white/70 hover:bg-education-primary/20 transition-colors shadow">
              <svg className="h-6 w-6 text-education-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z"></path><rect width="4" height="12" x="2" y="9" rx="2"/></svg>
            </a>
          </motion.div>
        </motion.div>
        {/* Copyright & Developed by */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="relative z-10 text-center text-xs text-muted-foreground py-4 flex flex-col gap-1 items-center"
        >
          <span>© {new Date().getFullYear()} GUIDMENEXT.</span>
        </motion.div>
        {/* Animated Wavy SVG at the very bottom, full width, not fixed */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, type: 'spring', bounce: 0.3 }}
          className="w-screen max-w-none overflow-hidden"
          style={{ minWidth: '100vw' }}
        >
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-24">
            <defs>
              <linearGradient id="footerWaveGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4f8cff" />
                <stop offset="100%" stopColor="#a0e9ff" />
              </linearGradient>
            </defs>
            <motion.path
              d="M0,80L60,90C120,100,240,120,360,112C480,104,600,56,720,53.3C840,51,960,85,1080,101.3C1200,117,1320,107,1380,101.3L1440,96L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z"
              fill="url(#footerWaveGradient)"
              animate={{
                d: 'M0,80L60,90C120,100,240,120,360,112C480,104,600,56,720,53.3C840,51,960,85,1080,101.3C1200,117,1320,107,1380,101.3L1440,96L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z'
              }}
              transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', type: 'tween' }}
            />
          </svg>
        </motion.div>
      </footer>
    </div>
  );
}
