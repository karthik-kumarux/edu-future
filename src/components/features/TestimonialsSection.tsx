
import { useState } from "react";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock data for testimonials
const testimonials = [
  {
    id: 1,
    name: "Raj Sharma",
    role: "B.Tech Graduate",
    college: "IIT Delhi",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=700&q=80",
    quote: "The platform guided me through my engineering college applications and helped me secure a spot at my dream institution. The AI advisor was particularly helpful for doubts and queries."
  },
  {
    id: 2,
    name: "Priya Patel",
    role: "Medical Student",
    college: "AIIMS",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=700&q=80",
    quote: "I was confused about which stream to choose after 10th grade. The career assessment and counseling services helped me understand my strengths, leading me to pursue my passion for medicine."
  },
  {
    id: 3,
    name: "Arjun Kapoor",
    role: "MBA Student",
    college: "ISB Hyderabad",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=700&q=80",
    quote: "After completing my B.Tech, I was torn between a job and higher education. The platform's guidance and resources helped me make an informed decision to pursue an MBA."
  }
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };
  
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">What Our Students Say</h2>
          <p className="text-muted-foreground">
            Success stories from students who found their educational and career paths through our platform.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto relative">
          <div className="relative bg-card border border-border rounded-xl p-6 md:p-10 shadow-sm">
            <div className="absolute top-0 left-0 transform -translate-x-4 -translate-y-4">
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.5 0H20L12.5 25H5L12.5 0Z" fill="currentColor" fillOpacity="0.1" />
                <path d="M27.5 0H35L27.5 25H20L27.5 0Z" fill="currentColor" fillOpacity="0.1" />
              </svg>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-muted flex-shrink-0">
                <img 
                  src={testimonials[currentIndex].image} 
                  alt={testimonials[currentIndex].name} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1">
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className="h-5 w-5 text-yellow-500 fill-yellow-500" 
                    />
                  ))}
                </div>
                <blockquote className="text-lg md:text-xl italic mb-6">
                  "{testimonials[currentIndex].quote}"
                </blockquote>
                <div>
                  <p className="font-semibold text-foreground">
                    {testimonials[currentIndex].name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {testimonials[currentIndex].role}, {testimonials[currentIndex].college}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center md:justify-end gap-2 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={prevTestimonial}
                className="rounded-full"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Previous testimonial</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextTestimonial}
                className="rounded-full"
              >
                <ArrowRight className="h-4 w-4" />
                <span className="sr-only">Next testimonial</span>
              </Button>
            </div>
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {testimonials.map((_, index) => (
                <button 
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full ${
                    currentIndex === index ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                >
                  <span className="sr-only">Testimonial {index + 1}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
