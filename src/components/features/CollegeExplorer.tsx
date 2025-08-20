
import { useState } from "react";
import { Search, MapPin, GraduationCap, Star, Building, CalendarClock, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Updated mock data for colleges with deadlines and status
const collegeData = [
  {
    id: 1,
    name: "Stanford University",
    location: "Stanford, CA",
    courses: ["Computer Science", "Business", "Engineering"],
    feesRange: "$50,000 - $60,000",
    rating: 4.9,
    deadline: "2025-06-15",
    status: "upcoming",
    image: "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: 2,
    name: "Harvard University",
    location: "Cambridge, MA",
    courses: ["Law", "Medicine", "Arts"],
    feesRange: "$55,000 - $65,000",
    rating: 4.8,
    deadline: "2025-05-01",
    status: "filling_soon",
    image: "https://images.unsplash.com/photo-1559135197-8a45e5e5f61d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: 3,
    name: "MIT",
    location: "Cambridge, MA",
    courses: ["Engineering", "Physics", "Computer Science"],
    feesRange: "$53,000 - $63,000",
    rating: 4.9,
    deadline: "2025-01-20",
    status: "deadline",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: 4,
    name: "Oxford University",
    location: "Oxford, UK",
    courses: ["Philosophy", "Literature", "Economics"],
    feesRange: "£30,000 - £40,000",
    rating: 4.7,
    deadline: "2024-12-10", 
    status: "closed",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
  },
];

// Helper function to get status badge info
const getStatusInfo = (status: string) => {
  switch(status) {
    case "deadline":
      return { 
        label: "Deadline Soon", 
        color: "bg-red-500 text-white" 
      };
    case "upcoming":
      return { 
        label: "Upcoming", 
        color: "bg-blue-500 text-white" 
      };
    case "filling_soon":
      return { 
        label: "Filling Soon", 
        color: "bg-amber-500 text-white" 
      };
    case "closed":
      return { 
        label: "Closed", 
        color: "bg-gray-500 text-white" 
      };
    default:
      return { 
        label: "Unknown", 
        color: "bg-gray-400 text-white" 
      };
  }
};

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

export default function CollegeExplorer() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredColleges, setFilteredColleges] = useState(collegeData);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    const filtered = collegeData.filter(college => 
      college.name.toLowerCase().includes(term.toLowerCase()) || 
      college.location.toLowerCase().includes(term.toLowerCase()) ||
      college.courses.some(course => course.toLowerCase().includes(term.toLowerCase()))
    );
    
    setFilteredColleges(filtered);
  };

  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl font-bold mb-4">Explore Top Colleges</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find the perfect college based on your preferences and requirements. Browse through our extensive database of universities worldwide.
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-8 sm:mb-10 relative">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by college name, location or course..."
            className="pl-12 py-6 text-base"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <Tabs defaultValue="all" className="max-w-5xl mx-auto">
          <div className="overflow-x-auto pb-2">
            <TabsList className="mb-8 mx-auto flex justify-start md:justify-center">
              <TabsTrigger value="all">All Colleges</TabsTrigger>
              <TabsTrigger value="engineering">Engineering</TabsTrigger>
              <TabsTrigger value="medicine">Medicine</TabsTrigger>
              <TabsTrigger value="business">Business</TabsTrigger>
              <TabsTrigger value="arts">Arts & Humanities</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="space-y-6">
            {filteredColleges.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredColleges.map(college => {
                  const statusInfo = getStatusInfo(college.status);
                  return (
                    <div key={college.id} className="group border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 bg-card">
                      {/* Image container with overlay */}
                      <div className="h-48 overflow-hidden relative">
                        <img 
                          src={college.image} 
                          alt={college.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        
                        {/* Rating badge */}
                        <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/70 backdrop-blur-sm text-foreground px-2 py-1 rounded-md text-sm font-medium flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400" /> 
                          <span>{college.rating}</span>
                        </div>
                        
                        {/* Status badge */}
                        <div className={`absolute bottom-3 left-3 px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 ${statusInfo.color}`}>
                          {college.status === "deadline" && <Clock className="h-3.5 w-3.5" />}
                          {college.status === "upcoming" && <CalendarClock className="h-3.5 w-3.5" />}
                          {college.status === "filling_soon" && <Clock className="h-3.5 w-3.5" />}
                          {college.status === "closed" && <Clock className="h-3.5 w-3.5" />}
                          {statusInfo.label}
                        </div>
                      </div>
                      
                      <div className="p-5">
                        <h3 className="text-xl font-semibold mb-1">{college.name}</h3>
                        <p className="text-muted-foreground mb-2 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {college.location}
                        </p>
                        
                        {/* Application deadline */}
                        <div className="flex items-center text-sm mb-3">
                          <CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-muted-foreground">Deadline: </span>
                          <span className="font-medium ml-1">{formatDate(college.deadline)}</span>
                        </div>
                        
                        <Separator className="my-3" />
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {college.courses.slice(0, 3).map((course, i) => (
                            <span 
                              key={i} 
                              className="text-xs bg-muted px-2 py-1 rounded-md"
                            >
                              {course}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground mb-4 flex items-center">
                          <Building className="h-4 w-4 mr-2" />
                          Fees: <span className="font-medium text-foreground ml-1">{college.feesRange}</span> per year
                        </p>
                        <div className="flex justify-between items-center">
                          <Button variant="outline" size="sm">View Details</Button>
                          <Button size="sm" className="bg-gradient-to-r from-education-primary to-education-secondary hover:opacity-90 transition-opacity border-0">Apply Now</Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No colleges found matching your search criteria.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="engineering">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Filter to show Engineering colleges will go here.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="medicine">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Filter to show Medicine colleges will go here.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="business">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Filter to show Business colleges will go here.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="arts">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Filter to show Arts & Humanities colleges will go here.</p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-10 text-center">
          <Button className="bg-gradient-to-r from-education-primary to-education-secondary border-0 hover:opacity-90 transition-opacity">
            Browse All Colleges
          </Button>
        </div>
      </div>
    </section>
  );
}
