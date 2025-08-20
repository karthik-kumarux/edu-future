import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useState, useEffect } from "react";
import { Search, MapPin, Filter, CalendarClock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
  CardImage,
} from "@/components/ui/card";
import { collection, getDocs, doc, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { getAuth } from "firebase/auth";

// Helper to get color and label for last date urgency
const getLastDateIndicator = (lastDate: string) => {
  const now = new Date();
  const date = new Date(lastDate);
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays > 30) {
    return { color: 'bg-green-500', label: 'Plenty of time' };
  } else if (diffDays > 7) {
    return { color: 'bg-yellow-400', label: 'Closing soon' };
  } else if (diffDays >= 0) {
    return { color: 'bg-red-500', label: 'Deadline imminent' };
  } else {
    return { color: 'bg-gray-400', label: 'Deadline passed' };
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

const locations = ["All Locations", "United States", "United Kingdom", "Canada", "Australia", "India"];
const coursesFilter = ["All Courses", "Computer Science", "Engineering", "Business", "Medicine", "Law", "Arts"];
const feesRanges = ["All Ranges", "Under $20,000", "$20,000 - $40,000", "$40,000 - $60,000", "Above $60,000"];

function CollegeImageSlideshow({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [images.length]);
  return (
    <img src={images[index]} alt="College" className="w-full h-full object-cover transition-all duration-500" />
  );
}

// Call this when user clicks Apply
const handleApplyCollege = async (college) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    alert("Please log in to apply.");
    return;
  }
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  const application = {
    collegeId: college.id,
    name: college.name,
    location: college.location,
    appliedAt: new Date().toISOString(),
    status: "Applied"
  };
  if (userSnap.exists()) {
    // Add to applications array (create if not exists)
    await updateDoc(userRef, {
      applications: arrayUnion(application)
    });
  } else {
    // Create user doc with applications array
    await setDoc(userRef, { applications: [application] }, { merge: true });
  }
};

export default function Colleges() {
  const [colleges, setColleges] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("All Locations");
  const [institutionType, setInstitutionType] = useState("All Types");
  const [filteredColleges, setFilteredColleges] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");
  const [locations, setLocations] = useState<string[]>(["All Locations"]);
  const [institutionTypes, setInstitutionTypes] = useState<string[]>(["All Types"]);

  useEffect(() => {
    const fetchColleges = async () => {
      const querySnapshot = await getDocs(collection(db, "colleges"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setColleges(data);
      setFilteredColleges(data);
      // Generate unique locations from colleges
      const uniqueLocations = Array.from(new Set(data.map((c: any) => c.location).filter(Boolean)));
      setLocations(["All Locations", ...uniqueLocations]);
      // Generate unique institution types from colleges
      const uniqueTypes = Array.from(new Set(data.map((c: any) => c.type).filter(Boolean)));
      setInstitutionTypes(["All Types", ...uniqueTypes]);
    };
    fetchColleges();
  }, []);

  // Helper to filter by tab/tag
  const filterByTab = (colleges: any[], tab: string) => {
    if (tab === "all") return colleges;
    const tagMap: Record<string, string> = {
      "top-rated": "Top Rated",
      "engineering": "Engineering",
      "medicine": "Medicine",
      "business": "Business",
    };
    const tag = tagMap[tab];
    return colleges.filter(college => Array.isArray(college.tags) && college.tags.includes(tag));
  };

  // Updated applyFilters to include tag and institution type filtering
  const applyFilters = (term: string, loc: string, type: string, tab: string) => {
    let filtered = colleges;
    if (term) {
      filtered = filtered.filter(college => 
        college.name.toLowerCase().includes(term.toLowerCase()) || 
        college.location.toLowerCase().includes(term.toLowerCase()) ||
        (Array.isArray(college.courses) && college.courses.some((c: string) => c.toLowerCase().includes(term.toLowerCase()))) ||
        (Array.isArray(college.tags) && college.tags.some((t: string) => t.toLowerCase().includes(term.toLowerCase())))
      );
    }
    if (loc !== "All Locations") {
      filtered = filtered.filter(college => college.location === loc);
    }
    if (type !== "All Types") {
      filtered = filtered.filter(college => college.type === type);
    }
    // Tab/tag filtering
    filtered = filterByTab(filtered, tab);
    setFilteredColleges(filtered);
  };

  // Update search and filter handlers to use selectedTab
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    applyFilters(term, location, institutionType, selectedTab);
  };

  // When tab changes, re-apply filters
  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    applyFilters(searchTerm, location, institutionType, tab);
  };

  // When filters change, re-apply with selectedTab
  const handleLocationChange = (value: string) => {
    setLocation(value);
    applyFilters(searchTerm, value, institutionType, selectedTab);
  };
  const handleInstitutionTypeChange = (value: string) => {
    setInstitutionType(value);
    applyFilters(searchTerm, location, value, selectedTab);
  };

  const currentColleges = filteredColleges;

  return (
    <DashboardLayout>
      <div className="container px-4 mx-auto">
        <div className="flex flex-col space-y-8">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-education-primary to-education-secondary bg-clip-text text-transparent">
              Colleges
            </h1>
            <p className="text-muted-foreground">
              Find the perfect college based on your preferences and requirements.
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              className="pl-10 py-6 pr-20 text-base shadow-sm border-education-primary/20 focus-visible:ring-education-primary"
              placeholder="Search colleges by name, location, or course..."
              value={searchTerm}
              onChange={handleSearch}
            />
            <Button 
              variant="outline" 
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 border-education-primary/30 text-education-primary hover:text-education-secondary hover:border-education-secondary"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-5 w-5" />
            </Button>
          </div>
          {showFilters && (
            <div className="p-4 lg:p-6 border rounded-lg bg-card shadow-md animate-fade-in border-education-primary/20 max-w-xs space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block text-education-primary">Location</label>
                <Select value={location} onValueChange={handleLocationChange}>
                  <SelectTrigger className="border-education-primary/20">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block text-education-primary">Institution Type</label>
                <Select value={institutionType} onValueChange={handleInstitutionTypeChange}>
                  <SelectTrigger className="border-education-primary/20">
                    <SelectValue placeholder="Select institution type" />
                  </SelectTrigger>
                  <SelectContent>
                    {institutionTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <Tabs value={selectedTab} onValueChange={handleTabChange} className="w-full">
            <div className="overflow-x-auto pb-2">
              <TabsList className="mb-6 bg-muted/50 p-1 border border-education-primary/10 w-full md:w-auto">
                <TabsTrigger value="all" className="data-[state=active]:bg-education-primary data-[state=active]:text-white">All Colleges</TabsTrigger>
                <TabsTrigger value="top-rated" className="data-[state=active]:bg-education-primary data-[state=active]:text-white">Top Rated</TabsTrigger>
                <TabsTrigger value="engineering" className="data-[state=active]:bg-education-primary data-[state=active]:text-white">Engineering</TabsTrigger>
                <TabsTrigger value="medicine" className="data-[state=active]:bg-education-primary data-[state=active]:text-white">Medicine</TabsTrigger>
                <TabsTrigger value="business" className="data-[state=active]:bg-education-primary data-[state=active]:text-white">Business</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value={selectedTab} className="space-y-6">
              {currentColleges.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {currentColleges.map((college) => {
                    const lastDateIndicator = getLastDateIndicator(college.lastDateToApply);
                    return (
                      <Card key={college.id} className="w-64 h-80 mx-auto bg-card text-card-foreground rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden flex flex-col border-0 p-0 group relative">
                        {/* Last date indicator dot */}
                        <div className={`absolute top-2 right-2 flex items-center z-10`} title={lastDateIndicator.label}>
                          <span className={`w-3 h-3 rounded-full ${lastDateIndicator.color} border-2 border-card shadow`} />
                        </div>
                        {/* Card Image - 70% height */}
                        <div className="relative h-[56%] w-full overflow-hidden">
                          {Array.isArray(college.images) && college.images.length > 1 ? (
                            <CollegeImageSlideshow images={college.images} />
                          ) : (
                            <CardImage src={Array.isArray(college.images) ? college.images[0] : college.image} alt={college.name} className="h-full w-full object-cover rounded-t-2xl shadow-md" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                        </div>
                        <div className="h-0.5 w-full bg-gradient-to-r from-education-primary/10 via-muted to-education-secondary/10" />
                        <div className="flex-1 flex flex-col justify-between h-[44%]">
                          <CardHeader className="pb-0 px-3 pt-2">
                            <CardTitle className="text-xs font-bold text-education-primary truncate font-sans tracking-tight group-hover:text-education-secondary transition-colors">
                              {college.name}
                            </CardTitle>
                            <CardDescription className="flex items-center text-[12px] text-muted-foreground truncate">
                              <MapPin className="h-3 w-3 mr-1" />
                              {college.location}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-1 px-3 pb-1">
                            <div className="flex items-center text-[12px] gap-2">
                              <CalendarClock className="h-3 w-3 mr-1 text-education-secondary" />
                              <span className="text-muted-foreground">Last Date:</span>
                              <span className="font-semibold text-education-primary">{formatDate(college.lastDateToApply)}</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {Array.isArray(college.courses) &&
                                college.courses.map((course: string, idx: number) => (
                                  <span key={idx} className="text-[10px] bg-education-primary/10 text-education-primary px-1.5 py-0.5 rounded-md font-medium">
                                    {course}
                                  </span>
                                ))
                              }
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-between pt-0 px-3 pb-2 gap-2">
                            <Button variant="outline" size="sm" className="border-education-primary/30 text-xs px-3 py-1 font-semibold rounded-lg hover:bg-education-primary/10 transition-colors" onClick={() => { setSelectedCollege(college); setModalOpen(true); }}>View</Button>
                            <a
                              href={college.applyLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => handleApplyCollege(college)}
                            >
                              <Button size="sm" className="bg-education-primary hover:bg-education-secondary text-xs px-3 py-1 font-semibold rounded-lg shadow-md transition-colors">
                                Apply
                              </Button>
                            </a>
                          </CardFooter>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg">
                  <p className="text-muted-foreground">No colleges found matching your search criteria.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl w-full rounded-2xl p-0 overflow-hidden bg-card text-card-foreground">
          {selectedCollege && (
            <div className="flex flex-col">
              <div className="relative w-full h-64 bg-muted">
                {Array.isArray(selectedCollege.images) && selectedCollege.images.length > 0 ? (
                  <CollegeImageSlideshow images={selectedCollege.images} />
                ) : (
                  <img src={selectedCollege.image} alt={selectedCollege.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-6 space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-education-primary">{selectedCollege.name}</DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">{selectedCollege.location} • {selectedCollege.type?.charAt(0).toUpperCase() + selectedCollege.type?.slice(1)}</DialogDescription>
                </DialogHeader>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="bg-education-primary/10 text-education-primary px-2 py-1 rounded">Last Date: {selectedCollege.lastDateToApply}</span>
                  <span className="bg-education-secondary/10 text-education-secondary px-2 py-1 rounded">Created: {formatDate(selectedCollege.createdAt)}</span>
                  <a href={selectedCollege.website} target="_blank" rel="noopener noreferrer" className="underline text-education-primary px-2 py-1">Website</a>
                </div>
                <div className="text-sm text-card-foreground"><b>Description:</b> {selectedCollege.description}</div>
                <div className="text-sm text-card-foreground"><b>Department:</b> {selectedCollege.department}</div>
                <div className="text-sm text-card-foreground"><b>Courses:</b> {selectedCollege.courses}</div>
              </div>
              <DialogFooter className="flex justify-between items-center px-6 pb-6">
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
                <a
                  href={selectedCollege.applyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleApplyCollege(selectedCollege)}
                >
                  <Button className="bg-education-primary hover:bg-education-secondary text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-colors">
                    Apply
                  </Button>
                </a>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
