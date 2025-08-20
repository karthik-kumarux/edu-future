import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Twitter, Facebook, Linkedin } from "lucide-react";
import Header from "@/components/Header";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { toast } from "sonner";

export default function Contact() {
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const email = form.email.value;
    const subject = form.subject.value;
    const message = form.message.value;
    try {
      await addDoc(collection(db, "contacts"), {
        name,
        email,
        subject,
        message,
        createdAt: new Date().toISOString(),
      });
      toast.success("Message sent successfully!");
      form.reset();
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 mt-28">
      <Header />
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center min-h-[30vh] w-full overflow-hidden py-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 flex flex-col items-center"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 bg-gradient-to-r from-education-primary to-education-secondary bg-clip-text text-transparent">Contact Us</h1>
          <p className="max-w-xl text-muted-foreground text-base md:text-lg">
            Have questions, feedback, or need support? Reach out to us and our team will get back to you as soon as possible.
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
      {/* Contact Form Section */}
      <section className="py-12 px-4 flex justify-center items-center">
        <motion.form
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: 'spring', bounce: 0.25 }}
          className="w-full max-w-lg bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8 flex flex-col gap-6 relative z-10"
          onSubmit={handleContactSubmit}
        >
          <h2 className="text-xl font-bold mb-2 text-center">Send us a message</h2>
          <div className="flex flex-col gap-4">
            <input type="text" name="name" required placeholder="Your Name" className="w-full px-4 py-3 rounded-xl border border-border bg-white/80 focus:bg-white focus:border-education-primary outline-none transition-all duration-200 shadow-sm" />
            <input type="email" name="email" required placeholder="Your Email" className="w-full px-4 py-3 rounded-xl border border-border bg-white/80 focus:bg-white focus:border-education-primary outline-none transition-all duration-200 shadow-sm" />
            <input type="text" name="subject" required placeholder="Subject" className="w-full px-4 py-3 rounded-xl border border-border bg-white/80 focus:bg-white focus:border-education-primary outline-none transition-all duration-200 shadow-sm" />
            <textarea name="message" required placeholder="Message" rows={4} className="w-full px-4 py-3 rounded-xl border border-border bg-white/80 focus:bg-white focus:border-education-primary outline-none transition-all duration-200 shadow-sm resize-none" />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="mt-2 w-full py-3 rounded-xl bg-gradient-to-r from-education-primary to-education-secondary text-white font-bold text-lg shadow-lg hover:from-education-secondary hover:to-education-primary transition-all duration-200"
          >
            Send Message
          </motion.button>
        </motion.form>
      </section>
      {/* Contact Info & Socials */}
      <section className="py-10 px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
          className="container mx-auto flex flex-col md:flex-row items-center justify-center gap-10"
        >
          <motion.div
            variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.7 }}
            className="flex flex-col items-center gap-2"
          >
            <span className="flex items-center gap-2 text-education-primary font-semibold"><Mail className="h-5 w-5" /> support@guidmenext.com</span>
            <span className="flex items-center gap-2 text-education-secondary font-semibold"><Phone className="h-5 w-5" /> +91 98765 43210</span>
            <span className="flex items-center gap-2 text-education-accent font-semibold"><MapPin className="h-5 w-5" /> Mumbai, India</span>
          </motion.div>
          <motion.div
            variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex gap-6 items-center justify-center"
          >
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="rounded-full p-3 bg-white/80 hover:bg-education-primary/20 transition-colors shadow">
              <Twitter className="h-6 w-6 text-education-primary" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="rounded-full p-3 bg-white/80 hover:bg-education-primary/20 transition-colors shadow">
              <Facebook className="h-6 w-6 text-education-primary" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="rounded-full p-3 bg-white/80 hover:bg-education-primary/20 transition-colors shadow">
              <Linkedin className="h-6 w-6 text-education-primary" />
            </a>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}