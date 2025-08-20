
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const careerPaths = [
  {
    title: "Post-10th Grade",
    description: "Discover the right stream for your high school education based on your interests and aptitude.",
    paths: [
      "Science (PCM/PCB)",
      "Commerce",
      "Arts/Humanities",
      "Vocational Courses"
    ],
    color: "from-blue-500 to-cyan-400"
  },
  {
    title: "Intermediate/+2",
    description: "Explore college options and prepare for entrance exams after your high school education.",
    paths: [
      "Engineering (JEE/BITSAT)",
      "Medical (NEET/AIIMS)",
      "Commerce (CA/CS/BBA)",
      "Design & Liberal Arts"
    ],
    color: "from-purple-500 to-indigo-400"
  },
  {
    title: "B.Tech Graduates",
    description: "Find career opportunities and higher education options after completing your bachelor's degree.",
    paths: [
      "Industry Jobs",
      "Master's Programs (M.Tech/MS)",
      "MBA",
      "Research & PhD"
    ],
    color: "from-green-500 to-emerald-400"
  }
];

export default function CareerPathways() {
  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Career Guidance for Every Stage</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Whether you're just starting your educational journey or looking for the next step, our platform provides tailored guidance for your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {careerPaths.map((path, index) => (
            <div 
              key={index} 
              className="bg-card rounded-xl overflow-hidden shadow-md border border-border hover:shadow-lg transition-all duration-300 hover-scale"
            >
              <div className={`h-2 w-full bg-gradient-to-r ${path.color}`}></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3">{path.title}</h3>
                <p className="text-muted-foreground mb-6">{path.description}</p>
                <ul className="space-y-3 mb-6">
                  {path.paths.map((item, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-education-success mr-2 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link to={`/careers/${path.title.toLowerCase().replace(" ", "-")}`}>
                  <Button variant="outline" className="w-full justify-between">
                    <span>Explore Pathways</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 max-w-4xl mx-auto bg-education-primary/10 dark:bg-education-primary/5 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-semibold mb-4">Not Sure About Your Career Path?</h3>
          <p className="text-muted-foreground mb-6">
            Take our AI-powered assessment to discover career options that match your personality, interests, and skills.
          </p>
          <Link to="/career-assessment">
            <Button className="bg-gradient-to-r from-education-primary to-education-secondary border-0">
              Take Career Assessment
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
