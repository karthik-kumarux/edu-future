
import { Calendar, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Mock data for events
const events = [
  {
    id: 1,
    title: "College Admissions Workshop",
    date: "May 15, 2025",
    time: "10:00 AM - 12:00 PM",
    location: "Virtual Event",
    category: "Workshop",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: 2,
    title: "JEE Preparation Strategies",
    date: "May 20, 2025",
    time: "4:00 PM - 5:30 PM",
    location: "Virtual Event",
    category: "Webinar",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: 3,
    title: "Career Fair 2025",
    date: "June 5, 2025",
    time: "9:00 AM - 4:00 PM",
    location: "Delhi Convention Center",
    category: "Career Fair",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: 4,
    title: "Overseas Education Summit",
    date: "June 15, 2025",
    time: "11:00 AM - 1:00 PM",
    location: "Virtual Event",
    category: "Summit",
    image: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80"
  },
];

export default function EventsSection() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Upcoming Events & Webinars</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stay updated with the latest educational events, webinars, and career fairs to enhance your knowledge and networking opportunities.
          </p>
        </div>

        <Tabs defaultValue="all" className="max-w-5xl mx-auto">
          <TabsList className="mb-8 mx-auto flex justify-center">
            <TabsTrigger value="all">All Events</TabsTrigger>
            <TabsTrigger value="webinars">Webinars</TabsTrigger>
            <TabsTrigger value="workshops">Workshops</TabsTrigger>
            <TabsTrigger value="fairs">Career Fairs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map(event => (
                <div key={event.id} className="border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-card hover-scale">
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={event.image} 
                      alt={event.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-education-primary hover:bg-education-primary/90">
                        {event.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-semibold mb-3">{event.title}</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <Button className="w-full">Register Now</Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="webinars">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Filter to show only webinars will go here.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="workshops">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Filter to show only workshops will go here.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="fairs">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Filter to show only career fairs will go here.</p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-12 text-center">
          <Button variant="outline">
            View All Events
          </Button>
        </div>
      </div>
    </section>
  );
}
