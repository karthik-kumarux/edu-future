
import { ArrowRight, Compass, GraduationCap, Calendar, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const features = [
  {
    icon: <Compass className="h-6 w-6 text-education-primary" />,
    title: "College Explorer",
    description: "Find and filter colleges based on location, fees, courses, and rankings to discover your perfect match."
  },
  {
    icon: <GraduationCap className="h-6 w-6 text-education-secondary" />,
    title: "Career Guidance",
    description: "Get personalized career recommendations based on your interests, skills, and educational background."
  },
  {
    icon: <Calendar className="h-6 w-6 text-education-accent" />,
    title: "Event Calendar",
    description: "Stay updated with upcoming college events, webinars, and entrance exam dates all in one place."
  },
  {
    icon: <MessageSquare className="h-6 w-6 text-education-success" />,
    title: "AI Advisor",
    description: "Chat with our AI advisor for instant answers to your college and career-related questions."
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need For Your Educational Journey</h2>
          <p className="text-lg text-muted-foreground">
            Our platform provides all the tools and resources you need to make informed decisions about your education and career.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-background rounded-xl p-6 shadow-sm border border-border hover-scale card-highlight"
            >
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-5">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground mb-4">{feature.description}</p>
              <Link to={`/${feature.title.toLowerCase().replace(" ", "-")}`} className="inline-flex items-center text-primary hover:underline">
                Learn more <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link to="/features">
            <Button variant="outline" className="text-foreground">
              View All Features <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
