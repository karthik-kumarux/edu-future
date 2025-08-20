import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, MapPin, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/card";
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth } from "firebase/auth";

// Filter options
const categories = ["All Events", "Workshop", "Webinar", "Career Fair", "Summit", "Seminar"];
const locations = ["All Locations", "Virtual Event", "Delhi", "Mumbai", "Bangalore", "Hyderabad"];

// Add a type for event objects
interface EventItem {
  id: string;
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  type?: string;
  location?: string;
  images?: string[];
  image?: string;
  applyLink?: string;
}

export default function Events() {
  const [searchTerm, setSearchTerm] = useState("");
  const [type, setType] = useState("All Types");
  const [location, setLocation] = useState("All Locations");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventItem[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [tab, setTab] = useState("all");
  const [typeOptions, setTypeOptions] = useState<string[]>([]);
  const [locationOptions, setLocationOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "events"));
        const eventsData: EventItem[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<EventItem, 'id'>)
        }));
        setEvents(eventsData);
        setFilteredEvents(eventsData);

        // Extract unique types and locations
        const types = Array.from(new Set(eventsData.map(e => e.type).filter(Boolean)));
        const locations = Array.from(new Set(eventsData.map(e => e.location).filter(Boolean)));
        setTypeOptions(types);
        setLocationOptions(locations);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, []);

  // Helper to filter events based on current state
  const getFilteredEvents = (term, typeValue, loc, tabValue) => {
    let filtered = events;
    // Search
    if (term) {
      filtered = filtered.filter(event =>
        event.title?.toLowerCase().includes(term.toLowerCase()) ||
        event.description?.toLowerCase().includes(term.toLowerCase())
      );
    }
    // Location
    if (loc !== "All Locations") {
      filtered = filtered.filter(event => event.location && event.location === loc);
    }
    // Tabs logic
    if (tabValue === "upcoming") {
      filtered = filtered.filter(event => {
        if (!event.date) return false;
        const eventDate = new Date(event.date);
        return eventDate > new Date();
      });
    } else if (tabValue === "workshops") {
      filtered = filtered.filter(event => event.type && event.type.toLowerCase() === "workshop");
    } else if (tabValue === "webinars") {
      filtered = filtered.filter(event => event.type && event.type.toLowerCase() === "webinar");
    } else if (tabValue === "fairs") {
      filtered = filtered.filter(event => event.type && (event.type.toLowerCase().includes("fair") || event.type.toLowerCase().includes("career")));
    } else if (typeValue !== "All Types") {
      filtered = filtered.filter(event => event.type === typeValue);
    }
    return filtered;
  };

  // When search/type/location/tab changes, update filteredEvents
  useEffect(() => {
    setFilteredEvents(getFilteredEvents(searchTerm, type, location, tab));
  }, [searchTerm, type, location, tab, events]);

  // When type filter changes, update tab if needed
  const handleTypeChange = (value) => {
    setType(value);
    // Sync tab with type
    if (value === "All Types") setTab("all");
    else if (value.toLowerCase() === "workshop") setTab("workshops");
    else if (value.toLowerCase() === "webinar") setTab("webinars");
    else if (value.toLowerCase().includes("fair")) setTab("fairs");
    else setTab("all");
  };

  // When tab changes, update type if needed
  const handleTabChange = (value) => {
    setTab(value);
    if (value === "all") setType("All Types");
    else if (value === "workshops") setType("Workshop");
    else if (value === "webinars") setType("Webinar");
    else if (value === "fairs") setType("Career Fair");
    // 'upcoming' is special, don't change type
  };

  // Call this when user clicks Register Now
  const handleRegisterEvent = async (event) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in to register for this event.");
      return;
    }
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const registration = {
      eventId: event.id,
      title: event.title,
      location: event.location,
      date: event.date,
      registeredAt: new Date().toISOString(),
      status: "Registered"
    };
    if (userSnap.exists()) {
      await updateDoc(userRef, {
        applications: arrayUnion(registration)
      });
    } else {
      await setDoc(userRef, { applications: [registration] }, { merge: true });
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold">Events & Webinars</h1>
            <p className="text-muted-foreground">
              Discover upcoming educational events, webinars, and career fairs to enhance your knowledge and networking.
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              className="pl-10 py-6 pr-20 text-base"
              placeholder="Search events by title, description..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <Button 
              variant="outline" 
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-5 w-5" />
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-card">
              <div>
                <label className="text-sm font-medium mb-1 block">Event Type</label>
                <Select value={type} onValueChange={handleTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Types">All Types</SelectItem>
                    {typeOptions.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Location</label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Locations">All Locations</SelectItem>
                    {locationOptions.map((loc) => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Events</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="workshops">Workshops</TabsTrigger>
              <TabsTrigger value="webinars">Webinars</TabsTrigger>
              <TabsTrigger value="fairs">Career Fairs</TabsTrigger>
            </TabsList>

            {["all", "upcoming", "workshops", "webinars", "fairs"].map(tabValue => (
              <TabsContent key={tabValue} value={tabValue} className="space-y-4">
                {getFilteredEvents(searchTerm, type, location, tabValue).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {getFilteredEvents(searchTerm, type, location, tabValue).map((event) => {
                      // Get image
                      let eventImage = "https://via.placeholder.com/300x180?text=No+Image";
                      if (Array.isArray(event.images) && event.images.length > 0) {
                        eventImage = event.images[0];
                      } else if (event.image) {
                        eventImage = event.image;
                      }
                      // Get time
                      let eventTime = "-";
                      if (event.date) {
                        // Try to extract time from ISO string
                        const dateObj = new Date(event.date);
                        if (!isNaN(dateObj.getTime())) {
                          // Format as HH:mm (24hr)
                          eventTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        }
                      }
                      // Register link
                      const hasApplyLink = !!event.applyLink;
                      return (
                        <Card key={event.id} className="w-64 h-80 mx-auto bg-card text-card-foreground rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden flex flex-col border-0 p-0 group relative">
                          {/* Card Image - 56% height */}
                          <div className="relative h-[56%] w-full overflow-hidden">
                            <img
                              src={eventImage}
                              alt={event.title}
                              className="h-full w-full object-cover rounded-t-2xl shadow-md"
                              onError={e => { e.currentTarget.src = 'https://via.placeholder.com/300x180?text=No+Image'; }}
                            />
                            <div className="absolute top-3 right-3 z-10">
                              <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-card-foreground">
                                {event.type}
                              </Badge>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                          </div>
                          <div className="h-0.5 w-full bg-gradient-to-r from-education-primary/10 via-muted to-education-secondary/10" />
                          <div className="flex-1 flex flex-col justify-between h-[44%]">
                            <CardHeader className="pb-0 px-3 pt-2">
                              <h3 className="text-xs font-bold text-education-primary truncate font-sans tracking-tight group-hover:text-education-secondary transition-colors mb-1">{event.title}</h3>
                              <p className="text-muted-foreground text-xs truncate">{event.description}</p>
                            </CardHeader>
                            <CardContent className="space-y-1 px-3 pb-1">
                              <div className="flex items-center text-[12px] gap-2">
                                <CalendarIcon className="h-3 w-3 mr-1 text-education-secondary" />
                                <span className="text-muted-foreground">{event.date}</span>
                              </div>
                              <div className="flex items-center text-[12px] gap-2">
                                <Clock className="h-3 w-3 mr-1 text-education-secondary" />
                                <span className="text-muted-foreground">{eventTime}</span>
                              </div>
                              <div className="flex items-center text-[12px] gap-2 justify-between">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-3 w-3 mr-1 text-education-secondary" />
                                  <span className="text-muted-foreground">{event.location}</span>
                                </div>
                                {hasApplyLink ? (
                                  <a href={event.applyLink} target="_blank" rel="noopener noreferrer" onClick={() => handleRegisterEvent(event)}>
                                    <Button
                                      className="
                                        h-8
                                        px-3
                                        bg-education-primary hover:bg-education-secondary
                                        text-white
                                        text-xs
                                        font-bold
                                        rounded-lg
                                        shadow
                                        transition-all
                                        duration-200
                                        flex items-center gap-1
                                        hover:scale-105
                                      "
                                    >
                                      Register Now
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                      </svg>
                                    </Button>
                                  </a>
                                ) : (
                                  <Button
                                    className="
                                      h-8
                                      px-3
                                      bg-education-primary
                                      text-white
                                      text-xs
                                      font-bold
                                      rounded-lg
                                      shadow
                                      opacity-60
                                      cursor-not-allowed
                                      flex items-center gap-1
                                    "
                                    disabled
                                  >
                                    Register Now
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-lg">
                    <p className="text-muted-foreground">No events found matching your search criteria.</p>
                    <Button 
                      variant="link"
                      onClick={() => {
                        setSearchTerm("");
                        setType("All Types");
                        setLocation("All Locations");
                        setFilteredEvents(events);
                      }}
                    >
                      Clear all filters
                    </Button>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
