import { motion } from "framer-motion";
import { Calendar, Users, Lightbulb, Rocket, Heart } from "lucide-react";
import Header from "@/components/Header";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 mt-28">
      <Header />
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center min-h-[40vh] w-full overflow-hidden py-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 flex flex-col items-center"
        >
          <span className="inline-flex items-center gap-2 font-extrabold text-3xl md:text-4xl bg-gradient-to-r from-education-primary to-education-secondary bg-clip-text text-transparent mb-4">
            <img
                src="../gude.png"  // Replace with your image path
                alt="Logo"
                className="h-7 w-7 rounded-full object-cover"
              />
            <span className="ml-2">GUIDMENEXT</span>
          </span>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Empowering Your Future, Every Step of the Way</h1>
          <p className="max-w-xl text-muted-foreground text-base md:text-lg">
            GUIDMENEXT is dedicated to helping students and young professionals discover opportunities, make informed decisions, and achieve their dreams through technology, guidance, and community.
          </p>
        </motion.div>
        {/* Animated background blob */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.18 }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-education-primary rounded-full blur-3xl z-0"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.12 }}
          transition={{ duration: 1.2, delay: 0.7 }}
          className="absolute -bottom-32 -right-32 w-[400px] h-[400px] bg-education-secondary rounded-full blur-3xl z-0"
        />
      </section>
      {/* Values Section */}
      <section className="py-12 px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
          className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {[{
            icon: <Users className="h-8 w-8 text-education-primary" />,
            title: "Community",
            desc: "We believe in the power of collaboration and support."
          }, {
            icon: <Lightbulb className="h-8 w-8 text-education-secondary" />,
            title: "Innovation",
            desc: "We use technology to open new doors for students."
          }, {
            icon: <Rocket className="h-8 w-8 text-education-accent" />,
            title: "Growth",
            desc: "We help you reach your full potential."
          }, {
            icon: <Heart className="h-8 w-8 text-education-success" />,
            title: "Care",
            desc: "Your journey matters to us."
          }].map((v, i) => (
            <motion.div
              key={v.title}
              variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.7, type: "spring", bounce: 0.3, delay: i * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-xl border border-border hover:shadow-2xl hover:scale-[1.04] transition-all duration-300 group flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-education-primary/10 to-education-secondary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {v.icon}
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-education-primary transition-colors">
                {v.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {v.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>
      {/* Story / Vision Section */}
      <section className="py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="container mx-auto max-w-3xl text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Story</h2>
          <p className="text-muted-foreground text-lg mb-6">
            GUIDMENEXT was founded with a vision to bridge the gap between ambition and opportunity. We saw how overwhelming it can be to navigate education and career choices, so we built a platform that brings together information, guidance, and a supportive community—all in one place.
          </p>
          <p className="text-muted-foreground text-base">
            Whether you're searching for the right college, exploring career paths, or looking for events and resources, GUIDMENEXT is here to empower you. Our mission is to make your journey smoother, more informed, and more inspiring.
          </p>
        </motion.div>
      </section>
    </div>
  );
} 