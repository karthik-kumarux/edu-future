
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img
                src="../gude.png"  // Replace with your image path
                alt="Logo"
                className="h-7 w-7 rounded-full object-cover"
              />
              <span className="text-xl font-display font-semibold">GUIDMENEXT</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Empowering students with the right education and career guidance for a successful future.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-base mb-4">For Students</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/colleges" className="text-muted-foreground hover:text-foreground transition-colors">
                  College Finder
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-muted-foreground hover:text-foreground transition-colors">
                  Course Explorer
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-muted-foreground hover:text-foreground transition-colors">
                  Career Guidance
                </Link>
              </li>
              <li>
                <Link to="/applications" className="text-muted-foreground hover:text-foreground transition-colors">
                  Application Tracker
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-base mb-4">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/events" className="text-muted-foreground hover:text-foreground transition-colors">
                  Events & Webinars
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                  Blog & Resources
                </Link>
              </li>
              <li>
                <Link to="/exams" className="text-muted-foreground hover:text-foreground transition-colors">
                  Entrance Exams
                </Link>
              </li>
              <li>
                <Link to="/scholarships" className="text-muted-foreground hover:text-foreground transition-colors">
                  Scholarships
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-base mb-4">Support</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/help" className="text-muted-foreground hover:text-foreground transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/counseling" className="text-muted-foreground hover:text-foreground transition-colors">
                  Book Counseling
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div className="sm:col-span-2 md:col-span-1">
            <h3 className="font-medium text-base mb-4">Subscribe</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Stay updated with the latest educational opportunities
            </p>
            <form className="space-y-2">
              <input
                type="email"
                placeholder="Your email"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="w-full px-3 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col-reverse sm:flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground mt-4 sm:mt-0">
            &copy; {new Date().getFullYear()} GUIDMENEXT.
          </p>
          <div className="flex space-x-6">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
