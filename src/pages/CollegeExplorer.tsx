import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, GraduationCap, Calendar, Filter, Star } from "lucide-react";
import { Slider } from "@/components/ui/slider";

// Locations for filter
const locations = ["Any Location", "USA", "UK", "India", "Singapore", "Australia", "Canada"];

// Course categories for filter
const courseCategories = ["All Courses", "Engineering", "Medicine", "Business", "Arts & Humanities", "Science", "Law"];

// Admission status options
const admissionStatuses = ["Any Status", "Open", "Closing Soon", "Closed"];

// Slideshow component for college images
import { useState as useSlideshowState } from "react";
function CollegeImageSlideshow({ images, alt }) {
  const [index, setIndex] = useSlideshowState(0);
  if (!Array.isArray(images) || images.length === 0) return null;
  const prev = (e) => {
    e.stopPropagation();
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  };
  const next = (e) => {
    e.stopPropagation();
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  };
  return (
    <div className="relative w-full h-full">
      <img
        src={images[index]}
        alt={alt}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full px-2 py-1 z-10"
            aria-label="Previous"
            type="button"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full px-2 py-1 z-10"
            aria-label="Next"
            type="button"
          >
            ›
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <span
                key={i}
                className={`inline-block w-2 h-2 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const CollegeExplorer = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Any Location");
  const [selectedCourseCategory, setSelectedCourseCategory] = useState("All Courses");
  const [selectedAdmissionStatus, setSelectedAdmissionStatus] = useState("Any Status");
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [colleges, setColleges] = useState([]);
  const [filteredColleges, setFilteredColleges] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch colleges from Firestore on mount
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "colleges"));
        const collegesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setColleges(collegesData);
        setFilteredColleges(collegesData);
      } catch (error) {
        console.error("Error fetching colleges:", error);
      }
    };
    fetchColleges();
  }, []);

  // Filter colleges based on search and filter criteria
  useEffect(() => {
    let result = colleges;
    // Filter by search term
    if (searchTerm) {
      result = result.filter(college =>
        college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        college.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (Array.isArray(college.courses) && college.courses.some(course => course.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }
    // Filter by location
    if (selectedLocation !== "Any Location") {
      result = result.filter(college => college.location.includes(selectedLocation));
    }
    // Filter by course category
    if (selectedCourseCategory !== "All Courses") {
      result = result.filter(college =>
        Array.isArray(college.courses) && college.courses.some(course => course.includes(selectedCourseCategory))
      );
    }
    // Filter by admission status
    if (selectedAdmissionStatus !== "Any Status") {
      result = result.filter(college => college.admissionStatus === selectedAdmissionStatus);
    }
    setFilteredColleges(result);
  }, [colleges, searchTerm, selectedLocation, selectedCourseCategory, selectedAdmissionStatus, priceRange]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedLocation("Any Location");
    setSelectedCourseCategory("All Courses");
    setSelectedAdmissionStatus("Any Status");
    setPriceRange([0, 100]);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">College Explorer</h1>
            <p className="text-muted-foreground mt-1">
              Find your perfect college match from our extensive database
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="md:w-auto w-full flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search colleges, courses, locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 py-6 text-base md:text-lg"
          />
        </div>

        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle>Filter Options</CardTitle>
              <CardDescription>Refine your college search</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Select
                    value={selectedLocation}
                    onValueChange={setSelectedLocation}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Locations</SelectLabel>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Course Category</label>
                  <Select
                    value={selectedCourseCategory}
                    onValueChange={setSelectedCourseCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select course category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Categories</SelectLabel>
                        {courseCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Admission Status</label>
                  <Select
                    value={selectedAdmissionStatus}
                    onValueChange={setSelectedAdmissionStatus}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select admission status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Status</SelectLabel>
                        {admissionStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Fee Range</label>
                <div className="pt-4 px-2">
                  <Slider
                    value={priceRange}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={setPriceRange}
                    className="mb-6"
                  />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Budget</span>
                    <span className="text-sm text-muted-foreground">Premium</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Clear All Filters
              </Button>
            </CardFooter>
          </Card>
        )}

        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Colleges</TabsTrigger>
            <TabsTrigger value="top-rated">Top Rated</TabsTrigger>
            <TabsTrigger value="admissions-open">Admissions Open</TabsTrigger>
            <TabsTrigger value="closing-soon">Closing Soon</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-6">
            {filteredColleges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredColleges.map((college) => (
                  <Card key={college.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group max-w-xs mx-auto p-2">
                    <div className="relative h-28 overflow-hidden">
                      {Array.isArray(college.images) && college.images.length > 0 ? (
                        college.images.length === 1 ? (
                          <img
                            src={college.images[0]}
                            alt={college.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <CollegeImageSlideshow images={college.images} alt={college.name} />
                        )
                      ) : (
                        <img
                          src="https://via.placeholder.com/400x200?text=No+Image"
                          alt={college.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm text-foreground flex items-center gap-1 px-2 py-1 rounded-md">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{college.rating}</span>
                      </div>
                      
                      <div className="absolute bottom-3 left-3">
                        <Badge 
                          className={
                            college.admissionStatus === "Open" 
                              ? "bg-green-500 hover:bg-green-600" 
                              : college.admissionStatus === "Closing Soon"
                              ? "bg-amber-500 hover:bg-amber-600" 
                              : "bg-red-500 hover:bg-red-600"
                          }
                        >
                          {college.admissionStatus}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardHeader className="p-3 pb-1">
                      <CardTitle className="line-clamp-1 text-base">{college.name}</CardTitle>
                      <div className="flex items-center text-xs text-muted-foreground gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="line-clamp-1">{college.location}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 p-3 pt-1">
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(college.courses)
                          ? college.courses.slice(0, 3).map((course, i) => (
                              <span 
                                key={i} 
                                className="text-[10px] bg-muted px-1.5 py-0.5 rounded-md"
                              >
                                {course}
                              </span>
                            ))
                          : <span className="text-xs text-muted-foreground">N/A</span>
                        }
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Fees: <span className="font-medium text-foreground">{college.feesRange}</span> per year
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center p-3 pt-1">
                      <Button variant="outline" size="sm">View Details</Button>
                      <Button size="sm">Apply Now</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No colleges found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or clearing some filters
                </p>
                <Button variant="outline" onClick={clearFilters} className="mt-4">
                  Clear All Filters
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="top-rated" className="text-center py-12">
            <p>Top rated colleges will be displayed here</p>
          </TabsContent>
          
          <TabsContent value="admissions-open" className="text-center py-12">
            <p>Colleges with open admissions will be displayed here</p>
          </TabsContent>
          
          <TabsContent value="closing-soon" className="text-center py-12">
            <p>Colleges with closing soon admissions will be displayed here</p>
          </TabsContent>
        </Tabs>

        <div className="flex justify-center py-8">
          <div className="join">
            <Button variant="outline" size="sm" className="mr-1 rounded-l-md">Previous</Button>
            <Button variant="outline" size="sm" className="mr-1 bg-muted">1</Button>
            <Button variant="outline" size="sm" className="mr-1">2</Button>
            <Button variant="outline" size="sm" className="mr-1">3</Button>
            <Button variant="outline" size="sm" className="mr-1">...</Button>
            <Button variant="outline" size="sm" className="rounded-r-md">Next</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CollegeExplorer;
