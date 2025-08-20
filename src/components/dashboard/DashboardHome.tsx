import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarCheck, Briefcase, School, Users, Clock } from "lucide-react";

const typeIcon = {
  college: School,
  job: Briefcase,
  event: CalendarCheck,
};

function getTypeIcon(type) {
  if (!type) return Users;
  if (type.toLowerCase().includes("college")) return School;
  if (type.toLowerCase().includes("job")) return Briefcase;
  if (type.toLowerCase().includes("event")) return CalendarCheck;
  return Users;
}

function getTypeLabel(app) {
  if (app.collegeId) return "College";
  if (app.jobId) return "Job";
  if (app.eventId) return "Event";
  return app.type || "Other";
}

function getStatusColor(status) {
  if (!status) return "bg-muted text-muted-foreground";
  if (status.toLowerCase().includes("accept")) return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300";
  if (status.toLowerCase().includes("reject")) return "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300";
  if (status.toLowerCase().includes("progress")) return "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300";
  return "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300";
}

export default function DashboardHome() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Count summary
  const collegeCount = applications.filter(app => app.collegeId).length;
  const jobCount = applications.filter(app => app.jobId).length;
  const eventCount = applications.filter(app => app.eventId).length;

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        setApplications([]);
        setLoading(false);
        return;
      }
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists() && Array.isArray(userSnap.data().applications)) {
        setApplications(userSnap.data().applications.sort((a, b) => {
          const dateA = new Date(a.appliedAt || a.registeredAt || 0).getTime();
          const dateB = new Date(b.appliedAt || b.registeredAt || 0).getTime();
          return dateB - dateA;
        }));
      } else {
        setApplications([]);
      }
      setLoading(false);
    };
    fetchApplications();
  }, []);

  return (
    <div className="container mx-auto py-8 px-2 md:px-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-education-primary to-education-secondary bg-clip-text text-transparent">
        Your Applications & Registrations
      </h1>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-card text-card-foreground rounded-xl shadow flex items-center gap-4 p-4 border border-education-primary/10">
          <School className="h-8 w-8 text-education-primary" />
          <div>
            <div className="text-lg font-bold">{collegeCount}</div>
            <div className="text-xs text-muted-foreground">Colleges Applied</div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="bg-card text-card-foreground rounded-xl shadow flex items-center gap-4 p-4 border border-education-primary/10">
          <Briefcase className="h-8 w-8 text-education-secondary" />
          <div>
            <div className="text-lg font-bold">{jobCount}</div>
            <div className="text-xs text-muted-foreground">Jobs Applied</div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="bg-card text-card-foreground rounded-xl shadow flex items-center gap-4 p-4 border border-education-primary/10">
          <CalendarCheck className="h-8 w-8 text-education-accent" />
          <div>
            <div className="text-lg font-bold">{eventCount}</div>
            <div className="text-xs text-muted-foreground">Events Registered</div>
          </div>
        </motion.div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-education-primary"></div>
        </div>
      ) : (
        <>
          {applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
              <Users className="h-16 w-16 text-education-primary/30 mb-4 animate-bounce" />
              <h2 className="text-xl font-semibold mb-2">No Applications Yet</h2>
              <p className="text-muted-foreground mb-4">You haven't applied or registered for any colleges, jobs, or events yet.</p>
              <Button asChild className="bg-gradient-to-r from-education-primary to-education-secondary mt-2">
                <a href="/colleges">Explore Opportunities</a>
              </Button>
            </div>
          ) : (
            <AnimatePresence>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {applications.map((app, idx) => {
                  const Icon = getTypeIcon(getTypeLabel(app));
                  return (
                    <motion.div
                      key={app.collegeId || app.jobId || app.eventId || idx}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 30 }}
                      transition={{ duration: 0.4, delay: idx * 0.07 }}
                    >
                      <Card className="hover:shadow-xl transition-shadow duration-300 border-0 bg-card text-card-foreground rounded-2xl overflow-hidden flex flex-col h-full">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="h-5 w-5 text-education-primary" />
                            <CardTitle className="text-base font-semibold">{app.title || app.name || app.company || "Untitled"}</CardTitle>
                          </div>
                          <Badge className={getStatusColor(app.status) + " text-xs px-2 py-1 rounded-full font-medium"}>{app.status || "Applied"}</Badge>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col gap-2">
                          <CardDescription className="text-xs text-muted-foreground mb-1">
                            {getTypeLabel(app)}
                          </CardDescription>
                          {app.company && <div className="text-xs"><Briefcase className="inline h-3 w-3 mr-1 text-education-secondary" />{app.company}</div>}
                          {app.location && <div className="text-xs"><Users className="inline h-3 w-3 mr-1 text-education-secondary" />{app.location}</div>}
                          {app.date && <div className="text-xs"><CalendarCheck className="inline h-3 w-3 mr-1 text-education-secondary" />{app.date}</div>}
                          {app.appliedAt && <div className="text-xs text-muted-foreground"><Clock className="inline h-3 w-3 mr-1" />Applied: {new Date(app.appliedAt).toLocaleDateString()}</div>}
                          {app.registeredAt && <div className="text-xs text-muted-foreground"><Clock className="inline h-3 w-3 mr-1" />Registered: {new Date(app.registeredAt).toLocaleDateString()}</div>}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          )}
        </>
      )}
    </div>
  );
}
