import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useState, useEffect } from "react";
import { Search, Filter, Calendar, Building, Star, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardImage,
} from "@/components/ui/card";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";

const jobTypes = ["All Types", "Internship", "Job", "Part-time"];

export default function Jobs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("All Locations");
  const [jobType, setJobType] = useState("All Types");
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedJob, setSelectedJob] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [locations, setLocations] = useState<string[]>(["All Locations"]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "jobs"));
        const jobsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setJobs(jobsData);
        setFilteredJobs(jobsData);
        const uniqueLocations = Array.from(new Set(jobsData.map((j: any) => j.location).filter(Boolean)));
        setLocations(["All Locations", ...uniqueLocations]);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };
    fetchJobs();
  }, []);

  const getDateBadge = (deadline: string): { color: string, text: string } => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilDeadline < 0) {
      return { color: "bg-red-100 text-red-800 border-red-300", text: "Expired" };
    } else if (daysUntilDeadline <= 7) {
      return { color: "bg-orange-100 text-orange-800 border-orange-300", text: "Closing Soon" };
    } else if (daysUntilDeadline <= 14) {
      return { color: "bg-yellow-100 text-yellow-800 border-yellow-300", text: "Closing in 2 weeks" };
    } else {
      return { color: "bg-green-100 text-green-800 border-green-300", text: "Open" };
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    applyFilters(term, location, jobType, activeTab);
  };

  const applyFilters =async (term: string, loc: string, type: string, tab: string) => {
    let filtered = jobs;
    if (term) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(term.toLowerCase()) || 
        job.company.toLowerCase().includes(term.toLowerCase()) ||
        (Array.isArray(job.skills) && job.skills.some((skill: string) => skill.toLowerCase().includes(term.toLowerCase())))
      );
    }
    if (loc !== "All Locations") {
      filtered = filtered.filter(job => job.location === loc);
    }
    if (type !== "All Types") {
      filtered = filtered.filter(job => (job.type || "").toLowerCase() === type.toLowerCase());
    }
    if (tab === "internships") {
      filtered = filtered.filter(job => (job.type || "").toLowerCase() === "part-time");
    } else if (tab === "jobs") {
      filtered = filtered.filter(job => (job.type || "").toLowerCase() === "full-time");
    } else if (tab === "applied") {
      const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const appliedJobIds = (userSnap.data().applications || []).map((app: any) => app.jobId);
        filtered = filtered.filter(job => appliedJobIds.includes(job.id));
      } else {
        filtered = []; // No applications
      }
    } else {
      filtered = []; // User not logged in
    }
  }
    setFilteredJobs(filtered);
  };

  useEffect(() => {
    applyFilters(searchTerm, location, jobType, activeTab);
    // eslint-disable-next-line
  }, [activeTab, jobs]);

  function JobImageSlideshow({ images }: { images: string[] }) {
    const [index, setIndex] = useState(0);
    useEffect(() => {
      const interval = setInterval(() => {
        setIndex((prev) => (prev + 1) % images.length);
      }, 2500);
      return () => clearInterval(interval);
    }, [images.length]);
    return (
      <img src={images[index]} alt="Job" className="w-full h-full object-cover transition-all duration-500" onError={e => { e.currentTarget.src = 'https://i.ibb.co/YTY9y0XW/noimage.jpg'; }} />
    );
  }

  const handleApplyJob = async (job) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in to apply for this job.");
      return;
    }
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const application = {
      jobId: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      appliedAt: new Date().toISOString(),
      status: "Applied"
    };
    if (userSnap.exists()) {
      await updateDoc(userRef, {
        applications: arrayUnion(application)
      });
    } else {
      await setDoc(userRef, { applications: [application] }, { merge: true });
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto">
        <div className="flex flex-col space-y-8">
          {/* Hero section */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-education-primary to-education-secondary p-8 text-white">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="mb-4 md:mb-0">
                <h1 className="text-3xl font-bold mb-2">
                  Discover Your Dream Career
                </h1>
                <p className="text-white/90 max-w-xl">
                  Explore thousands of internships and job opportunities from top companies
                  that will kickstart your professional journey.
                </p>
              </div>
              <Badge className="bg-white text-education-primary hover:bg-white/90 px-4 py-2 text-sm rounded-full flex items-center gap-2">
                <Star className="h-4 w-4 fill-education-secondary text-education-secondary" /> 
                {jobs.length} Jobs Available
              </Badge>
            </div>
          </div>

          {/* Search and filters */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground">
              <Search className="h-5 w-5" />
            </div>
            <Input
              className="pl-10 py-6 pr-20 text-base shadow-sm border-education-primary/20 focus-visible:ring-education-primary rounded-lg"
              placeholder="Search by job title, company, or skills..."
              value={searchTerm}
              onChange={handleSearch}
            />
            <Button 
              variant="outline" 
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 border-education-primary/30 text-education-primary hover:text-education-accent hover:border-education-accent"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-5 w-5" />
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6 border rounded-lg bg-card shadow-md animate-fade-in border-education-primary/20">
              <div>
                <label className="text-sm font-medium mb-1 block text-education-primary">Location</label>
                <Select value={location} onValueChange={(value) => {
                  setLocation(value);
                  applyFilters(searchTerm, value, jobType, activeTab);
                }}>
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
                <label className="text-sm font-medium mb-1 block text-education-primary">Job Type</label>
                <Select value={jobType} onValueChange={(value) => {
                  setJobType(value);
                  applyFilters(searchTerm, location, value, activeTab);
                }}>
                  <SelectTrigger className="border-education-primary/20">
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  className="w-full text-education-primary border-education-primary/30"
                  onClick={() => {
                    setSearchTerm("");
                    setLocation("All Locations");
                    setJobType("All Types");
                    setFilteredJobs(jobs);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}

          <Tabs 
            defaultValue="all" 
            className="w-full"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value)}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <TabsList className="bg-muted/50 p-1 border border-education-primary/10 w-full sm:w-auto">
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-education-primary data-[state=active]:text-white"
                >
                  All Opportunities
                </TabsTrigger>
                <TabsTrigger 
                  value="internships"
                  className="data-[state=active]:bg-education-primary data-[state=active]:text-white"
                >
                  Internships
                </TabsTrigger>
                <TabsTrigger 
                  value="jobs"
                  className="data-[state=active]:bg-education-primary data-[state=active]:text-white"
                >
                  Jobs
                </TabsTrigger>
                <TabsTrigger 
                  value="applied"
                  className="data-[state=active]:bg-education-primary data-[state=active]:text-white"
                >
                  Applied
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="space-y-6">
              {filteredJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                  {filteredJobs.map((job) => {
                    const jobImage = job.logo || (Array.isArray(job.images) && job.images.length > 0 ? job.images[0] : "https://i.ibb.co/YTY9y0XW/noimage.jpg");
                    return (
                      <Card 
                        key={job.id} 
                        className="w-64 h-80 mx-auto bg-card text-card-foreground rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden flex flex-col border-0 p-0 group relative"
                      >
                        {/* Last date indicator dot */}
                        <div className={`absolute top-2 right-2 flex items-center z-10`} title={getDateBadge(job.deadline).text}>
                          <span className={`w-3 h-3 rounded-full ${getDateBadge(job.deadline).color.split(' ')[0]} border-2 border-card shadow`} />
                        </div>
                        {/* Card Image - 70% height */}
                        <div className="relative h-[56%] w-full overflow-hidden">
                          {Array.isArray(job.images) && job.images.length > 1 ? (
                            <JobImageSlideshow images={job.images} />
                          ) : (
                            <CardImage src={jobImage} alt={job.company} className="h-full w-full object-cover rounded-t-2xl shadow-md" onError={e => { e.currentTarget.src = 'https://i.ibb.co/YTY9y0XW/noimage.jpg'; }} />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                        </div>
                        <div className="h-0.5 w-full bg-gradient-to-r from-education-primary/10 via-muted to-education-secondary/10" />
                        <div className="flex-1 flex flex-col justify-between h-[44%]">
                          <CardHeader className="pb-0 px-3 pt-2">
                            <CardTitle className="text-xs font-bold text-education-primary truncate font-sans tracking-tight group-hover:text-education-secondary transition-colors">
                              {job.title}
                            </CardTitle>
                            <CardDescription className="flex items-center text-[12px] text-muted-foreground truncate">
                              <Building className="h-3 w-3 mr-1" />
                              {job.company}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-1 px-3 pb-1">
                            <div className="flex items-center text-[12px] gap-2">
                              <Calendar className="h-3 w-3 mr-1 text-education-secondary" />
                              <span className="text-muted-foreground">Deadline:</span>
                              <span className="font-semibold text-education-primary">{new Date(job.lastDateToApply).toLocaleDateString()}</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {Array.isArray(job.skills) &&
                                job.skills.slice(0, 3).map((skill: string, idx: number) => (
                                  <span key={idx} className="text-[10px] bg-education-primary/10 text-education-primary px-1.5 py-0.5 rounded-md font-medium">
                                    {skill}
                                  </span>
                                ))
                              }
                              {Array.isArray(job.skills) && job.skills.length > 3 && (
                                <span className="text-[10px] bg-education-primary/10 text-education-primary px-1.5 py-0.5 rounded-md font-medium">
                                  +{job.skills.length - 3} more
                                </span>
                              )}
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-between pt-0 px-3 pb-2 gap-2">
                            <Button variant="outline" size="sm" className="border-education-primary/30 text-xs px-3 py-1 font-semibold rounded-lg hover:bg-education-primary/10 transition-colors" onClick={() => { setSelectedJob(job); setModalOpen(true); }}>View</Button>
                            <a href={job.applyLink} target="_blank" rel="noopener noreferrer" className="w-full" onClick={() => handleApplyJob(job)}>
                              <Button 
                                size="sm" 
                                className={`${job.applied ? 'bg-muted text-muted-foreground' : 'bg-education-primary hover:bg-education-secondary text-white'} text-xs px-3 py-1 font-semibold rounded-lg shadow-md transition-colors w-full`}
                                disabled={job.applied}
                              >
                                {job.applied ? "Applied" : "Apply"}
                              </Button>
                            </a>
                          </CardFooter>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg bg-muted/20">
                  <div className="flex justify-center mb-4">
                    <Briefcase className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No jobs found</h3>
                  <p className="text-muted-foreground mb-4">No jobs found matching your search criteria.</p>
                  <Button 
                    variant="outline" 
                    className="text-education-primary hover:text-education-secondary border-education-primary/30"
                    onClick={() => {
                      setSearchTerm("");
                      setLocation("All Locations");
                      setJobType("All Types");
                      setFilteredJobs(jobs);
                    }}
                  >
                    Clear all filters
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl w-full rounded-2xl p-0 overflow-hidden bg-card text-card-foreground">
          {selectedJob && (
            <div className="flex flex-col">
              <div className="relative w-full h-64 bg-muted">
                {Array.isArray(selectedJob.images) && selectedJob.images.length > 1 ? (
                  <JobImageSlideshow images={selectedJob.images} />
                ) : (
                  <img src={selectedJob.logo || (Array.isArray(selectedJob.images) && selectedJob.images.length > 0 ? selectedJob.images[0] : 'https://i.ibb.co/YTY9y0XW/noimage.jpg')} alt={selectedJob.company} className="w-full h-full object-cover" onError={e => { e.currentTarget.src = 'https://i.ibb.co/YTY9y0XW/noimage.jpg'; }} />
                )}
              </div>
              <div className="p-6 space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-education-primary">{selectedJob.title}</DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">{selectedJob.company} • {selectedJob.location}</DialogDescription>
                </DialogHeader>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="bg-education-primary/10 text-education-primary px-2 py-1 rounded">Deadline: {selectedJob.deadline}</span>
                  <span className="bg-education-secondary/10 text-education-secondary px-2 py-1 rounded">Created: {new Date(selectedJob.createdAt).toLocaleDateString()}</span>
                  <span className="bg-education-primary/10 text-education-primary px-2 py-1 rounded">Type: {selectedJob.type}</span>
                  <span className="bg-education-secondary/10 text-education-secondary px-2 py-1 rounded">Salary: {selectedJob.salary}</span>
                </div>
                <div className="text-sm text-gray-700"><b>Description:</b> {selectedJob.description}</div>
              </div>
              <DialogFooter className="flex justify-between items-center px-6 pb-6">
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
                <a href={selectedJob.applyLink} target="_blank" rel="noopener noreferrer" onClick={() => handleApplyJob(selectedJob)}>
                  <Button className="bg-education-primary hover:bg-education-secondary text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-colors">Apply</Button>
                </a>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
