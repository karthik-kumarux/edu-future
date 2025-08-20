
import { ArrowRight, Calendar, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function CTASection() {
  const features = [
    "Personalized college recommendations",
    "Career pathway guidance",
    "AI-powered advisor",
    "Application tracking system",
    "Latest events and webinars"
  ];

  return (
    <section className="py-20 bg-education-primary text-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full filter blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full filter blur-3xl" />
      </div>
      
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Navigate Your Future?</h2>
            <p className="text-white/80 text-lg mb-8">
              Join thousands of students who have found their perfect educational and career paths with our platform. Get personalized guidance today!
            </p>
            
            <ul className="space-y-3 mb-8">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <div className="mr-3 bg-white/20 rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            <div className="flex flex-wrap gap-4">
              <Link to="/signup">
                <Button size="lg" className="bg-white text-education-primary hover:bg-white/90">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/schedule-demo">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  Schedule a Demo
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-xl">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-education-primary mr-4">
                  <Calendar className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold">Book a Free Counseling Session</h3>
              </div>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm mb-1">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50 text-white"
                    placeholder="Enter your name"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm mb-1">Email Address</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50 text-white"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm mb-1">Educational Level</label>
                  <select className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50 text-white">
                    <option>Select your educational level</option>
                    <option>Post-10th Grade</option>
                    <option>Intermediate/+2</option>
                    <option>Bachelor's Degree</option>
                    <option>Master's Degree</option>
                  </select>
                </div>
                
                <Button className="w-full bg-white text-education-primary hover:bg-white/90">
                  Book Counseling Session
                </Button>
              </form>
              
              <p className="text-white/70 text-sm text-center mt-4">
                Free 30-minute session with our expert counselors
              </p>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-12 h-12 bg-education-secondary/30 rounded-full blur-md" />
            <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-education-accent/30 rounded-full blur-md" />
          </div>
        </div>
      </div>
    </section>
  );
}
