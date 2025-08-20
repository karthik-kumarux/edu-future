
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-10 left-[10%] w-72 h-72 bg-education-primary/10 rounded-full filter blur-3xl" />
        <div className="absolute bottom-10 right-[15%] w-80 h-80 bg-education-secondary/10 rounded-full filter blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              Shape Your Future with Confidence
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Navigate your educational journey with personalized guidance for colleges, courses, and career pathways. Your future starts here.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/signup">
                <Button size="lg" className="bg-gradient-to-r from-education-primary to-education-secondary border-0 hover:shadow-lg shadow-education-primary/20 transition-all duration-300">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/careers">
                <Button variant="outline" size="lg">
                  Explore Careers
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-background bg-muted`} />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">10,000+</span> students found their path already
              </p>
            </div>
          </div>

          <div className="order-1 md:order-2 relative">
            <div className="relative bg-gradient-to-br from-education-primary/5 to-education-secondary/5 rounded-xl p-2 shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt="Students collaborating" 
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-card p-4 rounded-lg shadow-lg glass-card">
                <div className="text-sm font-medium">Career match</div>
                <div className="text-xl font-bold mt-1">98% Accuracy</div>
                <div className="mt-2 w-full bg-muted rounded-full h-2">
                  <div className="bg-education-success h-2 rounded-full" style={{ width: "98%" }}></div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-white dark:bg-card p-4 rounded-lg shadow-lg glass-card">
                <div className="text-sm font-medium">Top Colleges</div>
                <div className="text-xl font-bold mt-1">500+ Added</div>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-education-primary"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-10 border-t border-border">
          <h3 className="text-center text-lg mb-8 text-muted-foreground">
            Trusted by students from universities across the country
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {["MIT", "Stanford", "Harvard", "Oxford", "Columbia"].map((university) => (
              <div key={university} className="text-lg font-semibold opacity-70 dark:opacity-50">
                {university}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
