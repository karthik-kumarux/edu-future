import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { 
  PlusCircle, Search, Send, Mail, Users, Briefcase, School, Calendar, 
  Edit, Trash, BarChart as BarChartIcon, PieChart as PieChartIcon, ChartBar,
  Bell, Download, Upload, Filter, ArrowUpDown, Eye, Info, Check,
  Plus, UploadCloud,
  PlusSquareIcon
} from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { collection, getDocs, query, where, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { addDoc, collection as firestoreCollection } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import * as XLSX from 'xlsx';
import { functions } from "@/lib/firebase"; // your initialized firebase app
import { httpsCallable } from "firebase/functions"
import { getEmailsForRecipient } from "@/lib/utils"; // from utils.ts

// Analytics mock data
const userAnalyticsData = [
  { name: 'Jan', users: 400, colleges: 20, employers: 15 },
  { name: 'Feb', users: 300, colleges: 18, employers: 12 },
  { name: 'Mar', users: 600, colleges: 25, employers: 20 },
  { name: 'Apr', users: 800, colleges: 30, employers: 22 },
  { name: 'May', users: 1000, colleges: 35, employers: 30 },
  { name: 'Jun', users: 1200, colleges: 40, employers: 35 },
];

const userTypeData = [
  { name: 'Students', value: 850, color: '#8B5CF6' },
  { name: 'Colleges', value: 125, color: '#D946EF' },
  { name: 'Employers', value: 75, color: '#F97316' },
  { name: 'Admins', value: 15, color: '#0EA5E9' },
];

const educationLevelData = [
  { name: '10th', value: 200, color: '#8B5CF6' },
  { name: 'Intermediate', value: 180, color: '#D946EF' },
  { name: 'B.Tech', value: 260, color: '#F97316' },
  { name: 'Degree', value: 140, color: '#0EA5E9' },
  { name: 'MBA', value: 75, color: '#22C55E' },
  { name: 'MCA', value: 55, color: '#EAB308' },
  { name: 'Others', value: 90, color: '#9333EA' },
];

// Platform activity data
const platformActivityData = [
  { name: 'Mon', visits: 1200, applications: 45, interviews: 12 },
  { name: 'Tue', visits: 1300, applications: 52, interviews: 15 },
  { name: 'Wed', visits: 1400, applications: 68, interviews: 22 },
  { name: 'Thu', visits: 1800, applications: 72, interviews: 24 },
  { name: 'Fri', visits: 2000, applications: 65, interviews: 20 },
  { name: 'Sat', visits: 1500, applications: 40, interviews: 18 },
  { name: 'Sun', visits: 1000, applications: 30, interviews: 10 },
];

// Chart colors
const CHART_COLORS = ['#8B5CF6', '#D946EF', '#F97316', '#0EA5E9', '#22C55E', '#EAB308', '#9333EA'];

// Email form schema
const emailFormSchema = z.object({
  subject: z.string().min(1, { message: "Subject is required" }),
  recipients: z.string().min(1, { message: "Recipients category is required" }),
  educationLevel: z.string().optional(),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
});

// Job form schema
const jobFormSchema = z.object({
  title: z.string().min(1, { message: "Job title is required" }),
  company: z.string().min(1, { message: "Company name is required" }),
  location: z.string().min(1, { message: "Location is required" }),
  type: z.string().min(1, { message: "Job type is required" }),
  salary: z.string().optional(),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  applyLink: z.string().url({ message: "Please enter a valid URL" }),
  lastDateToApply: z.string().min(1, { message: "Last date to apply is required" }),
});

// College form schema
const collegeFormSchema = z.object({
  name: z.string().min(1, { message: "College name is required" }),
  location: z.string().min(1, { message: "Location is required" }),
  type: z.string().min(1, { message: "College type is required" }),
  website: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  courses: z.string().min(1, { message: "Courses information is required" }),
  department: z.string().min(1, { message: "Department is required" }),
  lastDateToApply: z.string().min(1, { message: "Last date to apply is required" }),
  applyLink: z.string().url({ message: "Please enter a valid URL" }),
  tags: z.array(z.string()).optional(),
});

// Event form schema
const eventFormSchema = z.object({
  title: z.string().min(1, { message: "Event title is required" }),
  date: z.string().min(1, { message: "Event date is required" }),
  location: z.string().min(1, { message: "Location is required" }),
  type: z.string().min(1, { message: "Event type is required" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  organizer: z.string().min(1, { message: "Organizer is required" }),
  applyLink: z.string().url({ message: "Please enter a valid URL" }),
});

const Admin = () => {
  // All hooks at the top!
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("email");
  const [collegeImages, setCollegeImages] = useState<File[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Email form
  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      subject: "",
      recipients: "",
      educationLevel: "",
      message: "",
    },
  });

  // Watch the recipients value to conditionally show education level dropdown
  const selectedRecipient = emailForm.watch("recipients");

  // Job form
  const jobForm = useForm<z.infer<typeof jobFormSchema>>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      company: "",
      location: "",
      type: "",
      salary: "",
      description: "",
      applyLink: "",
      lastDateToApply: "",
    },
  });

  // College form
  const collegeForm = useForm<z.infer<typeof collegeFormSchema>>({
    resolver: zodResolver(collegeFormSchema),
    defaultValues: {
      name: "",
      location: "",
      type: "",
      website: "",
      description: "",
      courses: "",
      department: "",
      lastDateToApply: "",
      applyLink: "",
      tags: [],
    },
  });

  // Event form
  const eventForm = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      date: "",
      location: "",
      type: "",
      description: "",
      organizer: "",
      applyLink: "",
    },
  });

  // Job images
  const [jobImages, setJobImages] = useState<File[]>([]);

  // Event images state
  const [eventImages, setEventImages] = useState<File[]>([]);

  // Dashboard stats state
  const [stats, setStats] = useState({
    users: 0,
    jobs: 0,
    colleges: 0,
    events: 0,
  });

  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isViewJobModalOpen, setIsViewJobModalOpen] = useState(false);
  const [isEditJobModalOpen, setIsEditJobModalOpen] = useState(false);

  const [colleges, setColleges] = useState<any[]>([]);
  const [loadingColleges, setLoadingColleges] = useState(true);
  const [selectedCollege, setSelectedCollege] = useState<any>(null);
  const [isViewCollegeModalOpen, setIsViewCollegeModalOpen] = useState(false);
  const [isEditCollegeModalOpen, setIsEditCollegeModalOpen] = useState(false);

  const [events, setEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isViewEventModalOpen, setIsViewEventModalOpen] = useState(false);
  const [isEditEventModalOpen, setIsEditEventModalOpen] = useState(false);

  // State for completed tab selections
  const [selectedCompletedColleges, setSelectedCompletedColleges] = useState<string[]>([]);
  const [selectedCompletedJobs, setSelectedCompletedJobs] = useState<string[]>([]);
  const [selectedCompletedEvents, setSelectedCompletedEvents] = useState<string[]>([]);

  // Add modal openers for completed tab
  const [isAddCollegeModalOpen, setIsAddCollegeModalOpen] = useState(false);
  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);

  // Contact messages state
  const [contactMessages, setContactMessages] = useState<any[]>([]);
  const [loadingContactMessages, setLoadingContactMessages] = useState(true);

  const triggerJobFetch = async () => {
  try {
    const response = await fetch("https://us-central1-guidmenext-d65a9.cloudfunctions.net/fetchAndPostJobs", {
      method: "GET",
    });
    const data = await response.json();
    if (data.success) {
      toast.success(`🎉 ${data.count} jobs added!`);
    } else {
      toast.error("Job import failed.");
    }
  } catch (error) {
    console.error("❌ Error triggering job import:", error);
    toast.error("Failed to fetch and upload jobs.");
  }
};
  
  

  useEffect(() => {
    // Fetch dashboard stats from Firestore
    const fetchStats = async () => {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const jobsSnap = await getDocs(collection(db, "jobs"));
        const collegesSnap = await getDocs(collection(db, "colleges"));
        const eventsSnap = await getDocs(collection(db, "events"));
        setStats({
          users: usersSnap.size,
          jobs: jobsSnap.size,
          colleges: collegesSnap.size,
          events: eventsSnap.size,
        });
      } catch (error) {
        toast.error("Failed to fetch dashboard stats");
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchContactMessages = async () => {
      setLoadingContactMessages(true);
      try {
        const querySnapshot = await getDocs(firestoreCollection(db, "contacts"));
        const messages = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setContactMessages(messages);
      } catch (error) {
        toast.error("Failed to fetch contact messages");
      } finally {
        setLoadingContactMessages(false);
      }
    };
    fetchContactMessages();
  }, []);

  const handleDeleteContactMessage = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        await deleteDoc(doc(db, "contacts", id));
        setContactMessages(contactMessages.filter(msg => msg.id !== id));
        toast.success("Message deleted");
      } catch (error) {
        toast.error("Failed to delete message");
      }
    }
  };

  
  // Handle email form submission
  const sendEmail = httpsCallable(functions, "onSendEmail");
  const onSendEmail = async (data: z.infer<typeof emailFormSchema>) => {
  try {
    // 1. Extract form fields
    const { recipients, educationLevel, subject, message } = data;

    // 2. Fetch emails for selected recipient group
    const emails = await getEmailsForRecipient(recipients, educationLevel);

    if (emails.length === 0) {
      toast.error("No recipients found.");
      return;
    }

    // 3. Call Firebase Function with email data
    await sendEmail({
      to: emails, // can be a string[] or comma-separated string
      subject,
      message,
    });

    // 4. Show success toast
    let recipientText = recipients;
    if (recipients === "students" && educationLevel) {
      recipientText = `${educationLevel} students`;
    }

    toast.success(`Email sent successfully to ${emails.length} ${recipientText}`);
    emailForm.reset();
  } catch (error) {
    console.error("[SendEmail Error]:", error);
    toast.error("Failed to send email.");
  }
};


  // Handle job form submission
  const onAddJob = async (data: z.infer<typeof jobFormSchema>) => {
    try {
      let imageUrls = [];
      if (jobImages.length > 0) {
        imageUrls = await Promise.all(
          jobImages.map(async (file) => {
            const storageRef = ref(storage, `jobs/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            return await getDownloadURL(storageRef);
          })
        );
      }

      await addDoc(firestoreCollection(db, "jobs"), {
        ...data,
        images: imageUrls,
        createdAt: new Date().toISOString(),
      });

      toast.success("Job added successfully");
      jobForm.reset();
      setJobImages([]);
    } catch (error) {
      toast.error("Failed to add job. Please try again.");
      console.error(error);
    }
  };

  // Handle college form submission
  const onAddCollege = async (data: z.infer<typeof collegeFormSchema>) => {
    try {
      let imageUrls = [];
      if (collegeImages.length > 0) {
        imageUrls = await Promise.all(
          collegeImages.map(async (file) => {
            const storageRef = ref(storage, `colleges/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            return await getDownloadURL(storageRef);
          })
        );
      }

      await addDoc(firestoreCollection(db, "colleges"), {
        ...data,
        images: imageUrls,
        createdAt: new Date().toISOString(),
        tags: data.tags || [],
      });

      toast.success("College added successfully");
      collegeForm.reset();
      setCollegeImages([]);
    } catch (error) {
      toast.error("Failed to add college. Please try again.");
      console.error(error);
    }
  };

  // Handle event form submission
  const onAddEvent = async (data: z.infer<typeof eventFormSchema>) => {
    try {
      let imageUrls = [];
      if (eventImages.length > 0) {
        imageUrls = await Promise.all(
          eventImages.map(async (file) => {
            const storageRef = ref(storage, `events/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            return await getDownloadURL(storageRef);
          })
        );
      }

      await addDoc(firestoreCollection(db, "events"), {
        ...data,
        images: imageUrls,
        createdAt: new Date().toISOString(),
      });

      toast.success("Event added successfully");
      eventForm.reset();
      setEventImages([]);
    } catch (error) {
      toast.error("Failed to add event. Please try again.");
      console.error(error);
    }
  };

  // Filter state for users and role filter
  const [userFilter, setUserFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersData);
      } catch (error) {
        toast.error("Failed to fetch users");
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  // Filtered users based on search term and role
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      (user.name?.toLowerCase().includes(userFilter.toLowerCase()) ||
        user.email?.toLowerCase().includes(userFilter.toLowerCase()) ||
        (user.educationLevel && user.educationLevel.toLowerCase().includes(userFilter.toLowerCase())));
    const matchesRole =
      roleFilter === "all" || (user.role && user.role.toLowerCase() === roleFilter.toLowerCase());
    const matchesState =
      stateFilter === "all" || (user.state && user.state.toLowerCase() === stateFilter.toLowerCase());
    const matchesCity =
      cityFilter === "all" || (user.city && user.city.toLowerCase() === cityFilter.toLowerCase());
    return matchesSearch && matchesRole && matchesState && matchesCity;
  });

  // Stats summary data
  const statsSummary = [
    { 
      title: "Total Users", 
      value: stats.users.toLocaleString(), 
      change: "+12%", 
      trend: "up",
      icon: <Users className="h-4 w-4 text-blue-500" /> 
    },
    { 
      title: "Active Jobs", 
      value: stats.jobs.toLocaleString(), 
      change: "+5%", 
      trend: "up",
      icon: <Briefcase className="h-4 w-4 text-purple-500" /> 
    },
    { 
      title: "Registered Colleges", 
      value: stats.colleges.toLocaleString(), 
      change: "+8%", 
      trend: "up",
      icon: <School className="h-4 w-4 text-green-500" /> 
    },
    { 
      title: "Upcoming Events", 
      value: stats.events.toLocaleString(), 
      change: "+15%", 
      trend: "up",
      icon: <Calendar className="h-4 w-4 text-amber-500" /> 
    }
  ];

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdmin(user?.email === "guidmenext5@gmail.com");
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  // Appointments state
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  useEffect(() => {
    // Fetch appointments from Firestore
    const fetchAppointments = async () => {
      setLoadingAppointments(true);
      try {
        const querySnapshot = await getDocs(collection(db, "appointments"));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAppointments(data);
      } catch (error) {
        toast.error("Failed to fetch appointments");
      } finally {
        setLoadingAppointments(false);
      }
    };
    fetchAppointments();
  }, []);

  // Add these functions for user management
  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = async (user: any) => {
    if (window.confirm(`Are you sure you want to delete user ${user.name || user.email}?`)) {
      try {
        // Delete user from Firestore
        await deleteDoc(doc(db, "users", user.id));
        toast.success("User deleted successfully");
        
        // Update local state
        setUsers(users.filter(u => u.id !== user.id));
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user");
      }
    }
  };

  // Add export function
  const exportToExcel = () => {
    try {
      // Prepare data for export
      const exportData = filteredUsers.map(user => ({
        'Name': user.name || user.firstName + ' ' + user.lastName || user.email,
        'Email': user.email,
        'Phone Number': user.phoneNumber || 'N/A',
        'Role': user.role || 'Student',
        'Education Level': user.educationLevel || 'N/A',
        'State': user.state || 'N/A',
        'City': user.city || 'N/A',
        'Status': user.status || 'Active'
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Users');

      // Generate filename with current date
      const fileName = `users_export_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Save file
      XLSX.writeFile(wb, fileName);
      
      toast.success('Users exported successfully');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export users');
    }
  };

  // Fetch jobs
  useEffect(() => {
    const fetchJobs = async () => {
      setLoadingJobs(true);
      try {
        const querySnapshot = await getDocs(collection(db, "jobs"));
        const jobsData = await Promise.all(querySnapshot.docs.map(async docSnap => {
          const job = { id: docSnap.id, ...docSnap.data() } as any;
          if (job.lastDateToApply && new Date(job.lastDateToApply) < new Date() && job.status !== 'completed') {
            // Update status in Firestore
            await updateDoc(doc(db, "jobs", job.id), { status: 'completed' });
            return { ...job, status: 'completed' };
          }
          return job;
        }));
        setJobs(jobsData);
      } catch (error) {
        toast.error("Failed to fetch jobs");
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, []);

  // Job handlers
  const handleViewJob = (job: any) => {
    setSelectedJob(job);
    setIsViewJobModalOpen(true);
  };

  const handleEditJob = (job: any) => {
    setSelectedJob(job);
    jobForm.reset({
      title: job.title || '',
      company: job.company || '',
      location: job.location || '',
      type: job.type || '',
      salary: job.salary || '',
      description: job.description || '',
      applyLink: job.applyLink || '',
      lastDateToApply: job.lastDateToApply ? job.lastDateToApply.split('T')[0] : '',
    });
    setIsEditJobModalOpen(true);
  };

  const handleDeleteJob = async (job: any) => {
    if (window.confirm(`Are you sure you want to delete job ${job.title}?`)) {
      try {
        await deleteDoc(doc(db, "jobs", job.id));
        toast.success("Job deleted successfully");
        setJobs(jobs.filter(j => j.id !== job.id));
      } catch (error) {
        console.error("Error deleting job:", error);
        toast.error("Failed to delete job");
      }
    }
  };

  // Fetch colleges
  useEffect(() => {
    const fetchColleges = async () => {
      setLoadingColleges(true);
      try {
        const querySnapshot = await getDocs(collection(db, "colleges"));
        const collegesData = await Promise.all(querySnapshot.docs.map(async docSnap => {
          const college = { id: docSnap.id, ...docSnap.data() } as any;
          if (college.lastDateToApply && new Date(college.lastDateToApply) < new Date() && college.status !== 'completed') {
            await updateDoc(doc(db, "colleges", college.id), { status: 'completed' });
            return { ...college, status: 'completed' };
          }
          return college;
        }));
        setColleges(collegesData);
      } catch (error) {
        toast.error("Failed to fetch colleges");
      } finally {
        setLoadingColleges(false);
      }
    };
    fetchColleges();
  }, []);

  // College handlers
  const handleViewCollege = (college: any) => {
    setSelectedCollege(college);
    setIsViewCollegeModalOpen(true);
  };

  const handleEditCollege = (college: any) => {
    setSelectedCollege(college);
    setIsEditCollegeModalOpen(true);
  };

  const handleDeleteCollege = async (college: any) => {
    if (window.confirm(`Are you sure you want to delete college ${college.name}?`)) {
      try {
        await deleteDoc(doc(db, "colleges", college.id));
        toast.success("College deleted successfully");
        setColleges(colleges.filter(c => c.id !== college.id));
      } catch (error) {
        console.error("Error deleting college:", error);
        toast.error("Failed to delete college");
      }
    }
  };

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingEvents(true);
      try {
        const querySnapshot = await getDocs(collection(db, "events"));
        const eventsData = await Promise.all(querySnapshot.docs.map(async docSnap => {
          const event = { id: docSnap.id, ...docSnap.data() } as any;
          if (event.date && new Date(event.date) < new Date() && event.status !== 'completed') {
            await updateDoc(doc(db, "events", event.id), { status: 'completed' });
            return { ...event, status: 'completed' };
          }
          return event;
        }));
        setEvents(eventsData);
      } catch (error) {
        toast.error("Failed to fetch events");
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  // Event handlers
  const handleViewEvent = (event: any) => {
    setSelectedEvent(event);
    setIsViewEventModalOpen(true);
  };

  const handleEditEvent = (event: any) => {
    setSelectedEvent(event);
    setIsEditEventModalOpen(true);
  };

  const handleDeleteEvent = async (event: any) => {
    if (window.confirm(`Are you sure you want to delete event ${event.title}?`)) {
      try {
        await deleteDoc(doc(db, "events", event.id));
        toast.success("Event deleted successfully");
        setEvents(events.filter(e => e.id !== event.id));
      } catch (error) {
        console.error("Error deleting event:", error);
        toast.error("Failed to delete event");
      }
    }
  };

  // Delete selected completed items
  const handleDeleteSelectedCompletedColleges = async () => {
    for (const id of selectedCompletedColleges) {
      await deleteDoc(doc(db, "colleges", id));
    }
    setColleges(colleges.filter(c => !selectedCompletedColleges.includes(c.id)));
    setSelectedCompletedColleges([]);
    toast.success("Selected colleges deleted");
  };
  const handleDeleteSelectedCompletedJobs = async () => {
    for (const id of selectedCompletedJobs) {
      await deleteDoc(doc(db, "jobs", id));
    }
    setJobs(jobs.filter(j => !selectedCompletedJobs.includes(j.id)));
    setSelectedCompletedJobs([]);
    toast.success("Selected jobs deleted");
  };
  const handleDeleteSelectedCompletedEvents = async () => {
    for (const id of selectedCompletedEvents) {
      await deleteDoc(doc(db, "events", id));
    }
    setEvents(events.filter(e => !selectedCompletedEvents.includes(e.id)));
    setSelectedCompletedEvents([]);
    toast.success("Selected events deleted");
  };

  // Only after all hooks:
  if (!authChecked) {
    return <div>Checking authentication...</div>;
  }
  if (!isAdmin) {
    return <div>Unauthorized: Admin access only</div>;
  }
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="relative flex flex-col space-y-2 pb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-600 opacity-10 rounded-lg"></div>
          <h1 className="text-3xl font-bold tracking-tight z-10 pt-4 px-4">Admin Dashboard</h1>
          <p className="text-muted-foreground z-10 px-4 pb-2">
            Manage users, send emails, and add content to the platform.
          </p>
        </div>
        
        {/* Quick Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsSummary.map((stat, index) => (
            <Card key={index} className="bg-white dark:bg-gray-800 border-l-4 hover:shadow-md transition-all duration-200" style={{borderLeftColor: CHART_COLORS[index % CHART_COLORS.length]}}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    {stat.icon} {stat.title}
                  </p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  <p className={`text-xs ${stat.trend === "up" ? "text-green-500" : "text-red-500"} mt-1`}>
                    {stat.change} since last month
                  </p>
                </div>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  index % 4 === 0 ? "bg-blue-100 text-blue-600" :
                  index % 4 === 1 ? "bg-purple-100 text-purple-600" :
                  index % 4 === 2 ? "bg-green-100 text-green-600" :
                  "bg-amber-100 text-amber-600"
                } dark:bg-opacity-20`}>
                  {stat.icon}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 md:grid-cols-8 gap-2">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Email</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Jobs</span>
            </TabsTrigger>
            <TabsTrigger value="colleges" className="flex items-center gap-2">
              <School className="h-4 w-4" />
              <span className="hidden sm:inline">Colleges</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Events</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Appointments</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span className="hidden sm:inline">Completed</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Contact Messages</span>
            </TabsTrigger>
          </TabsList>

          {/* Email Management - Improved */}
          <TabsContent value="email" className="space-y-4">
            <Card className="bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-gray-800 border-purple-100 dark:border-purple-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Send Email
                </CardTitle>
                <CardDescription>
                  Send targeted emails to specific user groups on the platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(onSendEmail)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={emailForm.control}
                        name="recipients"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Recipients</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-white dark:bg-gray-950">
                                  <SelectValue placeholder="Select recipient category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="all">All Users</SelectItem>
                                <SelectItem value="students">Students</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={emailForm.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                              <Input placeholder="Email subject" className="bg-white dark:bg-gray-950" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {selectedRecipient === "students" && (
                      <div className="p-4 border border-purple-100 dark:border-purple-900/50 rounded-md bg-purple-50/50 dark:bg-purple-900/20">
                        <FormField
                          control={emailForm.control}
                          name="educationLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Education Level</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-white dark:bg-gray-950">
                                    <SelectValue placeholder="Select education level" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="all">All Education Levels</SelectItem>
                                  <SelectItem value="10th">10th Standard</SelectItem>
                                  <SelectItem value="intermediate">Intermediate</SelectItem>
                                  <SelectItem value="btech">B.Tech</SelectItem>
                                  <SelectItem value="bcom">B.Com</SelectItem>
                                  <SelectItem value="diploma">Diploma</SelectItem>
                                  <SelectItem value="mba">MBA</SelectItem>
                                  <SelectItem value="mca">MCA</SelectItem>
                                  <SelectItem value="mtech">M.Tech</SelectItem>
                                  <SelectItem value="ph.d">Ph.D</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Target students by their specific education level
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                    
                    <FormField
                      control={emailForm.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Write your email content here..." 
                              className="min-h-[200px] bg-white dark:bg-gray-950" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex items-center justify-between">
                      <Button type="button" variant="outline">
                        <Upload className="mr-2 h-4 w-4" /> Save Draft
                      </Button>
                      <Button type="submit" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                        <Send className="mr-2 h-4 w-4" /> Send Email
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            {/* Email Templates - New */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Email Templates
                </CardTitle>
                <CardDescription>
                  Pre-designed email templates for common communications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { 
                      title: "Welcome Email", 
                      description: "Send to new users after registration",
                      icon: <Users className="h-10 w-10 text-purple-500" />,
                      color: "purple"
                    },
                    { 
                      title: "Event Invitation", 
                      description: "Invite users to upcoming events",
                      icon: <Calendar className="h-10 w-10 text-blue-500" />,
                      color: "blue"
                    },
                    { 
                      title: "Job Alert", 
                      description: "Notify students about new job postings",
                      icon: <Briefcase className="h-10 w-10 text-green-500" />,
                      color: "green"
                    }
                  ].map((template, index) => (
                    <Card key={index} className={`border-${template.color}-200 hover:shadow-md transition-duration-200 cursor-pointer`}>
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className={`h-16 w-16 rounded-full bg-${template.color}-100 flex items-center justify-center mb-4`}>
                          {template.icon}
                        </div>
                        <h3 className="text-lg font-medium mb-1">{template.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                        <Button variant="outline" size="sm">
                          <Edit className="mr-2 h-4 w-4" /> Use Template
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="ghost" size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" /> Create New Template
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* User Management - Enhanced */}
          <TabsContent value="users" className="space-y-4">
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  User Management
                </CardTitle>
                <CardDescription>
                  View and manage all users registered on the platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                  <div className="relative w-full md:flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users by name, email, or education level..."
                      className="pl-8"
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter by role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="student">Students</SelectItem>
                        <SelectItem value="college admin">College Admins</SelectItem>
                        <SelectItem value="employer">Employers</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={stateFilter} onValueChange={setStateFilter}>
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter by state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All States</SelectItem>
                        <SelectItem value="andhra pradesh">Andhra Pradesh</SelectItem>
                        <SelectItem value="arunachal pradesh">Arunachal Pradesh</SelectItem>
                        <SelectItem value="assam">Assam</SelectItem>
                        <SelectItem value="bihar">Bihar</SelectItem>
                        <SelectItem value="chhattisgarh">Chhattisgarh</SelectItem>
                        <SelectItem value="goa">Goa</SelectItem>
                        <SelectItem value="gujarat">Gujarat</SelectItem>
                        <SelectItem value="haryana">Haryana</SelectItem>
                        <SelectItem value="himachal pradesh">Himachal Pradesh</SelectItem>
                        <SelectItem value="jharkhand">Jharkhand</SelectItem>
                        <SelectItem value="karnataka">Karnataka</SelectItem>
                        <SelectItem value="kerala">Kerala</SelectItem>
                        <SelectItem value="madhya pradesh">Madhya Pradesh</SelectItem>
                        <SelectItem value="maharashtra">Maharashtra</SelectItem>
                        <SelectItem value="manipur">Manipur</SelectItem>
                        <SelectItem value="meghalaya">Meghalaya</SelectItem>
                        <SelectItem value="mizoram">Mizoram</SelectItem>
                        <SelectItem value="nagaland">Nagaland</SelectItem>
                        <SelectItem value="odisha">Odisha</SelectItem>
                        <SelectItem value="punjab">Punjab</SelectItem>
                        <SelectItem value="rajasthan">Rajasthan</SelectItem>
                        <SelectItem value="sikkim">Sikkim</SelectItem>
                        <SelectItem value="tamil nadu">Tamil Nadu</SelectItem>
                        <SelectItem value="telangana">Telangana</SelectItem>
                        <SelectItem value="tripura">Tripura</SelectItem>
                        <SelectItem value="uttar pradesh">Uttar Pradesh</SelectItem>
                        <SelectItem value="uttarakhand">Uttarakhand</SelectItem>
                        <SelectItem value="west bengal">West Bengal</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={cityFilter} onValueChange={setCityFilter}>
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter by city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Cities</SelectItem>
                        <SelectItem value="mumbai">Mumbai</SelectItem>
                        <SelectItem value="delhi">Delhi</SelectItem>
                        <SelectItem value="bangalore">Bangalore</SelectItem>
                        <SelectItem value="hyderabad">Hyderabad</SelectItem>
                        <SelectItem value="chennai">Chennai</SelectItem>
                        <SelectItem value="kolkata">Kolkata</SelectItem>
                        <SelectItem value="pune">Pune</SelectItem>
                        <SelectItem value="ahmedabad">Ahmedabad</SelectItem>
                        <SelectItem value="jaipur">Jaipur</SelectItem>
                        <SelectItem value="lucknow">Lucknow</SelectItem>
                        <SelectItem value="kanpur">Kanpur</SelectItem>
                        <SelectItem value="nagpur">Nagpur</SelectItem>
                        <SelectItem value="indore">Indore</SelectItem>
                        <SelectItem value="thane">Thane</SelectItem>
                        <SelectItem value="bhopal">Bhopal</SelectItem>
                        <SelectItem value="visakhapatnam">Visakhapatnam</SelectItem>
                        <SelectItem value="patna">Patna</SelectItem>
                        <SelectItem value="vadodara">Vadodara</SelectItem>
                        <SelectItem value="ghaziabad">Ghaziabad</SelectItem>
                        <SelectItem value="ludhiana">Ludhiana</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" className="whitespace-nowrap">
                      <Filter className="mr-2 h-4 w-4" /> Filter
                    </Button>
                    <Button 
                      variant="outline" 
                      className="whitespace-nowrap"
                      onClick={exportToExcel}
                      disabled={filteredUsers.length === 0}
                    >
                      <Download className="mr-2 h-4 w-4" /> Export to Excel
                  </Button>
                  </div>
                </div>
                
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">
                          <div className="flex items-center gap-1">
                            User
                            <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead className="hidden md:table-cell">Phone</TableHead>
                        <TableHead className="hidden md:table-cell">Role</TableHead>
                        <TableHead className="hidden md:table-cell">Education</TableHead>
                        <TableHead className="hidden md:table-cell">State</TableHead>
                        <TableHead className="hidden md:table-cell">City</TableHead>
                        <TableHead className="hidden md:table-cell">Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingUsers ? (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            Loading users...
                          </TableCell>
                        </TableRow>
                      ) : filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id} className="hover:bg-muted/30">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className={`h-8 w-8 ${
                                  user.role === "Student"
                                    ? "bg-gradient-to-br from-blue-400 to-blue-600"
                                    : user.role === "College Admin"
                                    ? "bg-gradient-to-br from-purple-400 to-purple-600"
                                    : "bg-gradient-to-br from-amber-400 to-amber-600"
                                }`}>
                                  <AvatarImage src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName || user.email}`} />
                                  <AvatarFallback>{(user.firstName || user.email || "U").substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{user.firstName} {user.lastName}</p>
                                  <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {user.phoneNumber || 'N/A'}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge
                                variant="outline"
                                className={
                                  user.role === "Student"
                                    ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                                    : user.role === "Employer"
                                    ? "border-amber-500 text-amber-600 dark:border-amber-400 dark:text-amber-400"
                                    : "border-purple-500 text-purple-600 dark:border-purple-400 dark:text-purple-400"
                                }
                              >
                                {user.role || "Student"}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {user.educationLevel ? (
                                <Badge variant="secondary">{user.educationLevel}</Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">N/A</span>
                              )}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {user.state || 'N/A'}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {user.city || 'N/A'}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge
                                className={user.status === "Active"
                                  ? "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                                  : "bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700"
                                }
                              >
                                {user.status || "Active"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  title="View User"
                                  onClick={() => handleViewUser(user)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  title="Edit User"
                                  onClick={() => handleEditUser(user)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-destructive" 
                                  title="Delete User"
                                  onClick={() => handleDeleteUser(user)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            No users found matching your filters.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <div className="text-sm text-muted-foreground">Page 1 of 1</div>
                <Button variant="outline" size="sm" disabled>Next</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Job Management - Enhanced */}
          <TabsContent value="jobs" className="space-y-4">
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Add New Job
                </CardTitle>
                <CardDescription>
                  Create new job listings for the platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...jobForm}>
                  <form onSubmit={jobForm.handleSubmit(onAddJob)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={jobForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Frontend Developer" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={jobForm.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. TechCorp" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={jobForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. New York, NY" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={jobForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select job type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="full-time">Full-time</SelectItem>
                                <SelectItem value="part-time">Part-time</SelectItem>
                                <SelectItem value="contract">Contract</SelectItem>
                                <SelectItem value="internship">Internship</SelectItem>
                                <SelectItem value="remote">Remote</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={jobForm.control}
                        name="salary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Salary Range (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. $50,000 - $70,000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={jobForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the job responsibilities, requirements, etc." 
                              className="min-h-[150px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={jobForm.control}
                      name="lastDateToApply"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Date to Apply</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length > 3) {
                          toast.error("You can upload a maximum of 3 images.");
                          return;
                        }
                        setJobImages(files);
                      }}
                      disabled={jobForm.formState.isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground">Max 3 images. Only image files allowed.</p>
                    <div className="flex gap-2 mt-2">
                      {jobImages.map((file, idx) => (
                        <span key={idx} className="text-xs">{file.name}</span>
                      ))}
                    </div>
                    
                    <FormField
                      control={jobForm.control}
                      name="applyLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Apply Link</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. https://apply.company.com/job123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex flex-col sm:flex-row justify-end gap-2">
                      <Button type="button" variant="outline">Preview</Button>
                      <Button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Job
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>


          
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UploadCloud className="h-5 w-5" />
                  API Jobs
                  </CardTitle>
                <CardDescription>
                  Fetch and add jobs from RapidAPI
                </CardDescription>
                </CardHeader>
              <CardContent>
                <div>
                  <Button onClick={triggerJobFetch} className="mt-4 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all duration-200 text-white font-semibold shadow-md hover:shadow-lg">
                    Fetch & Add Jobs from RapidAPI
                  </Button>
                </div>
              </CardContent>
            </Card>


            {/* Jobs List */}
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Job Listings
                  </CardTitle>
                <CardDescription>
                  View and manage all job listings
                </CardDescription>
                </CardHeader>
                <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Job Title</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Last Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingJobs ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            Loading jobs...
                          </TableCell>
                        </TableRow>
                      ) : jobs.length > 0 ? (
                        jobs.map((job) => (
                          <TableRow key={job.id} className="hover:bg-muted/30">
                            <TableCell>
                              <div>
                                <p className="font-medium">{job.title}</p>
                                <p className="text-sm text-muted-foreground">{job.salary || 'Salary not specified'}</p>
                        </div>
                            </TableCell>
                            <TableCell>{job.company}</TableCell>
                            <TableCell>{job.location}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{job.type}</Badge>
                            </TableCell>
                            <TableCell>{new Date(job.lastDateToApply).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  title="View Job"
                                  onClick={() => handleViewJob(job)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  title="Edit Job"
                                  onClick={() => handleEditJob(job)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-destructive" 
                                  title="Delete Job"
                                  onClick={() => handleDeleteJob(job)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                        </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            No jobs found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  </div>
                </CardContent>
              </Card>
          </TabsContent>

          {/* College Management - Enhanced */}
          <TabsContent value="colleges" className="space-y-4">
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School className="h-5 w-5" />
                  Add New College
                </CardTitle>
                <CardDescription>
                  Add new colleges and educational institutions to the platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...collegeForm}>
                  <form onSubmit={collegeForm.handleSubmit(onAddCollege)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={collegeForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>College Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Stanford University" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={collegeForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Palo Alto, CA" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={collegeForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Institution Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select institution type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="public">Public</SelectItem>
                                <SelectItem value="private">Private</SelectItem>
                                <SelectItem value="community">Community College</SelectItem>
                                <SelectItem value="technical">Technical Institute</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={collegeForm.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. https://www.stanford.edu" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={collegeForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>College Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe the college, its history, mission, etc." 
                                className="min-h-[100px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={collegeForm.control}
                        name="courses"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Available Courses/Programs</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="List major courses and programs offered" 
                                className="min-h-[100px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={collegeForm.control}
                        name="department"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Department</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Computer Science, Engineering, Business" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={collegeForm.control}
                        name="lastDateToApply"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Date to Apply</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={collegeForm.control}
                        name="applyLink"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Apply Link</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. https://apply.college.edu" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={collegeForm.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags (Categories)</FormLabel>
                          <div className="flex flex-wrap gap-3">
                            {['Top Rated', 'Engineering', 'Medicine', 'Business'].map((tag) => (
                              <label key={tag} className="flex items-center gap-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={field.value?.includes(tag) || false}
                                  onChange={() => {
                                    if (field.value?.includes(tag)) {
                                      field.onChange(field.value.filter((t: string) => t !== tag));
                                    } else {
                                      field.onChange([...(field.value || []), tag]);
                                    }
                                  }}
                                  className="accent-education-primary"
                                />
                                <span className="text-xs font-medium">{tag}</span>
                              </label>
                            ))}
                          </div>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {(field.value || []).map((tag: string) => (
                              <span key={tag} className="bg-education-primary/10 text-education-primary px-2 py-1 rounded text-xs font-medium">{tag}</span>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-4">
                      <div>
                        <Label>College Images (Max 3)</Label>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length > 3) {
                              toast.error("You can upload a maximum of 3 images.");
                              return;
                            }
                            setCollegeImages(files);
                          }}
                          disabled={collegeForm.formState.isSubmitting}
                          className="mt-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Upload up to 3 images of the college campus, facilities, or events.</p>
                      </div>
                      
                      {collegeImages.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {collegeImages.map((file, idx) => (
                            <div key={idx} className="relative group">
                              <div className="w-24 h-24 rounded-lg border overflow-hidden">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`College image ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setCollegeImages(prev => prev.filter((_, i) => i !== idx));
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-end gap-2">
                      <Button type="button" variant="outline">Upload Logo</Button>
                      <Button type="submit" className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add College
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            {/* Colleges List */}
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School className="h-5 w-5" />
                  College Listings
                  </CardTitle>
                <CardDescription>
                  View and manage all college listings
                </CardDescription>
                </CardHeader>
                <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>College Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Last Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingColleges ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            Loading colleges...
                          </TableCell>
                        </TableRow>
                      ) : colleges.length > 0 ? (
                        colleges.map((college) => (
                          <TableRow key={college.id} className="hover:bg-muted/30">
                            <TableCell>
                              <div>
                                <p className="font-medium">{college.name}</p>
                                <p className="text-sm text-muted-foreground">{college.website || 'No website'}</p>
                        </div>
                            </TableCell>
                            <TableCell>{college.location}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{college.type}</Badge>
                            </TableCell>
                            <TableCell>{college.department}</TableCell>
                            <TableCell>{new Date(college.lastDateToApply).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  title="View College"
                                  onClick={() => handleViewCollege(college)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  title="Edit College"
                                  onClick={() => handleEditCollege(college)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-destructive" 
                                  title="Delete College"
                                  onClick={() => handleDeleteCollege(college)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                          </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            No colleges found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  </div>
                </CardContent>
              </Card>
          </TabsContent>

          {/* Event Management - Enhanced */}
          <TabsContent value="events" className="space-y-4">
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Add New Event
                </CardTitle>
                <CardDescription>
                  Create new events and workshops for the platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...eventForm}>
                  <form onSubmit={eventForm.handleSubmit(onAddEvent)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={eventForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Tech Career Fair" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={eventForm.control}
                        name="organizer"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Organizer</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. MIT Career Services" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={eventForm.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Date & Time</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={eventForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Campus Center, Room 101 or Virtual" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={eventForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select event type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="career-fair">Career Fair</SelectItem>
                                <SelectItem value="workshop">Workshop</SelectItem>
                                <SelectItem value="webinar">Webinar</SelectItem>
                                <SelectItem value="conference">Conference</SelectItem>
                                <SelectItem value="networking">Networking</SelectItem>
                                <SelectItem value="hackathon">Hackathon</SelectItem>
                                <SelectItem value="info-session">Info Session</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={eventForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the event, agenda, speakers, etc." 
                              className="min-h-[150px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={eventForm.control}
                      name="applyLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Apply Link</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. https://apply.event.com/register" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-4">
                      <div>
                        <Label>Event Images (Max 3)</Label>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length > 3) {
                              toast.error("You can upload a maximum of 3 images.");
                              return;
                            }
                            setEventImages(files);
                          }}
                          disabled={eventForm.formState.isSubmitting}
                          className="mt-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Upload up to 3 images of the event venue, past events, or promotional materials.</p>
                      </div>
                      
                      {eventImages.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {eventImages.map((file, idx) => (
                            <div key={idx} className="relative group">
                              <div className="w-24 h-24 rounded-lg border overflow-hidden">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Event image ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setEventImages(prev => prev.filter((_, i) => i !== idx));
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-end gap-2">
                      <Button type="button" variant="outline">Upload Banner</Button>
                      <Button type="submit" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Event
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            {/* Events List */}
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Event Listings
                </CardTitle>
                <CardDescription>
                  View and manage all event listings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event Title</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Organizer</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingEvents ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            Loading events...
                          </TableCell>
                        </TableRow>
                      ) : events.length > 0 ? (
                        events.map((event) => (
                          <TableRow key={event.id} className="hover:bg-muted/30">
                            <TableCell>
                        <div>
                                <p className="font-medium">{event.title}</p>
                                <p className="text-sm text-muted-foreground">{event.applyLink || 'No link'}</p>
                          </div>
                            </TableCell>
                            <TableCell>{event.date ? new Date(event.date).toLocaleString() : ''}</TableCell>
                            <TableCell>{event.location}</TableCell>
                            <TableCell>
                          <Badge variant="outline">{event.type}</Badge>
                            </TableCell>
                            <TableCell>{event.organizer}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  title="View Event"
                                  onClick={() => handleViewEvent(event)}
                                >
                                  <Eye className="h-4 w-4" />
                          </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  title="Edit Event"
                                  onClick={() => handleEditEvent(event)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-destructive" 
                                  title="Delete Event"
                                  onClick={() => handleDeleteEvent(event)}
                                >
                                  <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            No events found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="appointments" className="space-y-4">
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Booked Appointments
                </CardTitle>
                <CardDescription>
                  View all guidance session bookings from users.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingAppointments ? (
                  <div>Loading appointments...</div>
                ) : appointments.length === 0 ? (
                  <div className="text-muted-foreground">No appointments found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Message</TableHead>
                          <TableHead>Created At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {appointments.map((appt) => (
                          <TableRow key={appt.id}>
                            <TableCell>{appt.name}</TableCell>
                            <TableCell>{appt.email}</TableCell>
                            <TableCell>{appt.phone}</TableCell>
                            <TableCell>{appt.datetime}</TableCell>
                            <TableCell>{appt.message}</TableCell>
                            <TableCell>{new Date(appt.createdAt).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

              </CardContent>
            </Card>
          </TabsContent>
          {/* Completed Tab */}
          <TabsContent value="completed" className="space-y-6">
            {/* Completed Colleges */}
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School className="h-5 w-5" />
                  Completed Colleges
                </CardTitle>
                <CardDescription>All completed colleges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  <Button size="sm" variant="outline" onClick={() => setIsAddCollegeModalOpen(true)}>Add College</Button>
                  <Button size="sm" variant="destructive" onClick={handleDeleteSelectedCompletedColleges} disabled={selectedCompletedColleges.length === 0}>Delete Selected</Button>
                </div>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <input type="checkbox" checked={colleges.filter(c => c.status === 'completed').length > 0 && selectedCompletedColleges.length === colleges.filter(c => c.status === 'completed').length}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedCompletedColleges(colleges.filter(c => c.status === 'completed').map(c => c.id));
                              } else {
                                setSelectedCompletedColleges([]);
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>College Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {colleges.filter(c => c.status === 'completed').length > 0 ? (
                        colleges.filter(c => c.status === 'completed').map((college) => (
                          <TableRow key={college.id}>
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={selectedCompletedColleges.includes(college.id)}
                                onChange={e => {
                                  if (e.target.checked) {
                                    setSelectedCompletedColleges([...selectedCompletedColleges, college.id]);
                                  } else {
                                    setSelectedCompletedColleges(selectedCompletedColleges.filter(id => id !== college.id));
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>{college.name}</TableCell>
                            <TableCell>{college.location}</TableCell>
                            <TableCell>{college.type}</TableCell>
                            <TableCell><Badge variant="secondary">Completed</Badge></TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center">No completed colleges.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            {/* Completed Jobs */}
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Completed Jobs
                </CardTitle>
                <CardDescription>All completed jobs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  <Button size="sm" variant="outline" onClick={() => setIsAddJobModalOpen(true)}>Add Job</Button>
                  <Button size="sm" variant="destructive" onClick={handleDeleteSelectedCompletedJobs} disabled={selectedCompletedJobs.length === 0}>Delete Selected</Button>
                </div>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <input type="checkbox" checked={jobs.filter(j => j.status === 'completed').length > 0 && selectedCompletedJobs.length === jobs.filter(j => j.status === 'completed').length}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedCompletedJobs(jobs.filter(j => j.status === 'completed').map(j => j.id));
                              } else {
                                setSelectedCompletedJobs([]);
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>Job Title</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs.filter(j => j.status === 'completed').length > 0 ? (
                        jobs.filter(j => j.status === 'completed').map((job) => (
                          <TableRow key={job.id}>
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={selectedCompletedJobs.includes(job.id)}
                                onChange={e => {
                                  if (e.target.checked) {
                                    setSelectedCompletedJobs([...selectedCompletedJobs, job.id]);
                                  } else {
                                    setSelectedCompletedJobs(selectedCompletedJobs.filter(id => id !== job.id));
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>{job.title}</TableCell>
                            <TableCell>{job.company}</TableCell>
                            <TableCell>{job.location}</TableCell>
                            <TableCell><Badge variant="secondary">Completed</Badge></TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center">No completed jobs.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            {/* Completed Events */}
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Completed Events
                </CardTitle>
                <CardDescription>All completed events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  <Button size="sm" variant="outline" onClick={() => setIsAddEventModalOpen(true)}>Add Event</Button>
                  <Button size="sm" variant="destructive" onClick={handleDeleteSelectedCompletedEvents} disabled={selectedCompletedEvents.length === 0}>Delete Selected</Button>
                </div>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <input type="checkbox" checked={events.filter(e => e.status === 'completed').length > 0 && selectedCompletedEvents.length === events.filter(e => e.status === 'completed').length}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedCompletedEvents(events.filter(e => e.status === 'completed').map(e => e.id));
                              } else {
                                setSelectedCompletedEvents([]);
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>Event Title</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events.filter(e => e.status === 'completed').length > 0 ? (
                        events.filter(e => e.status === 'completed').map((event) => (
                          <TableRow key={event.id}>
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={selectedCompletedEvents.includes(event.id)}
                                onChange={e => {
                                  if (e.target.checked) {
                                    setSelectedCompletedEvents([...selectedCompletedEvents, event.id]);
                                  } else {
                                    setSelectedCompletedEvents(selectedCompletedEvents.filter(id => id !== event.id));
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>{event.title}</TableCell>
                            <TableCell>{event.date ? new Date(event.date).toLocaleDateString() : ''}</TableCell>
                            <TableCell>{event.location}</TableCell>
                            <TableCell><Badge variant="secondary">Completed</Badge></TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center">No completed events.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Contact Messages Tab */}
          <TabsContent value="contact" className="space-y-4">
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Contact Messages
                </CardTitle>
                <CardDescription>View and manage contact form submissions.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingContactMessages ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">Loading messages...</TableCell>
                        </TableRow>
                      ) : contactMessages.length > 0 ? (
                        contactMessages.map((msg) => (
                          <TableRow key={msg.id}>
                            <TableCell>{msg.name}</TableCell>
                            <TableCell>{msg.email}</TableCell>
                            <TableCell>{msg.subject}</TableCell>
                            <TableCell>{msg.message}</TableCell>
                            <TableCell>{msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ''}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" className="text-destructive" title="Delete Message" onClick={() => handleDeleteContactMessage(msg.id)}>
                                <Trash className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">No messages found.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add these modals */}
        {isViewModalOpen && selectedUser && (
          <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>User Details</DialogTitle>
                <DialogDescription>
                  View user information and activity
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.firstName || selectedUser.email}`} />
                    <AvatarFallback>{(selectedUser.firstName || selectedUser.email || "U").substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedUser.firstName} {selectedUser.lastName}</h3>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Role</Label>
                    <p className="text-sm">{selectedUser.role || "Student"}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <p className="text-sm">{selectedUser.status || "Active"}</p>
                  </div>
                  <div>
                    <Label>Education Level</Label>
                    <p className="text-sm">{selectedUser.educationLevel || "N/A"}</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {isEditModalOpen && selectedUser && (
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
                <DialogDescription>
                  Make changes to user information
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      defaultValue={selectedUser.firstName}
                      onChange={(e) => setSelectedUser({...selectedUser, firstName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      defaultValue={selectedUser.lastName}
                      onChange={(e) => setSelectedUser({...selectedUser, lastName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      defaultValue={selectedUser.email}
                      onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      defaultValue={selectedUser.role || "student"}
                      onValueChange={(value) => setSelectedUser({...selectedUser, role: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="college admin">College Admin</SelectItem>
                        <SelectItem value="employer">Employer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      defaultValue={selectedUser.status || "active"}
                      onValueChange={(value) => setSelectedUser({...selectedUser, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button onClick={async () => {
                  try {
                    // Update user in Firestore
                    await updateDoc(doc(db, "users", selectedUser.id), {
                      name: selectedUser.name,
                      email: selectedUser.email,
                      role: selectedUser.role,
                      status: selectedUser.status,
                      updatedAt: new Date().toISOString()
                    });
                    
                    // Update local state
                    setUsers(users.map(u => u.id === selectedUser.id ? selectedUser : u));
                    toast.success("User updated successfully");
                    setIsEditModalOpen(false);
                  } catch (error) {
                    console.error("Error updating user:", error);
                    toast.error("Failed to update user");
                  }
                }}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Job Modals */}
        {isViewJobModalOpen && selectedJob && (
          <Dialog open={isViewJobModalOpen} onOpenChange={setIsViewJobModalOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Job Details</DialogTitle>
                <DialogDescription>
                  View complete job information
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{selectedJob.title}</h3>
                  <p className="text-sm text-muted-foreground">{selectedJob.company}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Location</Label>
                    <p className="text-sm">{selectedJob.location}</p>
                  </div>
                  <div>
                    <Label>Job Type</Label>
                    <p className="text-sm">{selectedJob.type}</p>
                  </div>
                  <div>
                    <Label>Salary</Label>
                    <p className="text-sm">{selectedJob.salary || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label>Last Date to Apply</Label>
                    <p className="text-sm">{new Date(selectedJob.lastDateToApply).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <p className="text-sm whitespace-pre-wrap">{selectedJob.description}</p>
                </div>
                <div>
                  <Label>Apply Link</Label>
                  <a 
                    href={selectedJob.applyLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {selectedJob.applyLink}
                  </a>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewJobModalOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {isEditJobModalOpen && selectedJob && (
          <Dialog open={isEditJobModalOpen} onOpenChange={setIsEditJobModalOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit Job</DialogTitle>
                <DialogDescription>
                  Make changes to job information
                </DialogDescription>
              </DialogHeader>
              <Form {...jobForm}>
                <form onSubmit={jobForm.handleSubmit(async (data) => {
                  try {
                    await updateDoc(doc(db, "jobs", selectedJob.id), {
                      ...data,
                      updatedAt: new Date().toISOString()
                    });
                    
                    setJobs(jobs.map(j => j.id === selectedJob.id ? { ...j, ...data } : j));
                    toast.success("Job updated successfully");
                    setIsEditJobModalOpen(false);
                  } catch (error) {
                    console.error("Error updating job:", error);
                    toast.error("Failed to update job");
                  }
                })} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={jobForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || selectedJob.title} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={jobForm.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || selectedJob.company} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={jobForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || selectedJob.location} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={jobForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || selectedJob.type}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select job type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="full-time">Full-time</SelectItem>
                              <SelectItem value="part-time">Part-time</SelectItem>
                              <SelectItem value="contract">Contract</SelectItem>
                              <SelectItem value="internship">Internship</SelectItem>
                              <SelectItem value="remote">Remote</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={jobForm.control}
                      name="salary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Salary Range</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || selectedJob.salary || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={jobForm.control}
                      name="lastDateToApply"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Date to Apply</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field}
                              value={field.value || (selectedJob.lastDateToApply ? selectedJob.lastDateToApply.split('T')[0] : '')}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={jobForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field}
                            value={field.value || selectedJob.description}
                            className="min-h-[150px]" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={jobForm.control}
                    name="applyLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apply Link</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || selectedJob.applyLink} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditJobModalOpen(false)}>Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}

        {/* College Modals */}
        {isViewCollegeModalOpen && selectedCollege && (
          <Dialog open={isViewCollegeModalOpen} onOpenChange={setIsViewCollegeModalOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>College Details</DialogTitle>
                <DialogDescription>
                  View complete college information
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{selectedCollege.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedCollege.website || 'No website'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Location</Label>
                    <p className="text-sm">{selectedCollege.location}</p>
                  </div>
                  <div>
                    <Label>Type</Label>
                    <p className="text-sm">{selectedCollege.type}</p>
                  </div>
                  <div>
                    <Label>Department</Label>
                    <p className="text-sm">{selectedCollege.department}</p>
                  </div>
                  <div>
                    <Label>Last Date to Apply</Label>
                    <p className="text-sm">{new Date(selectedCollege.lastDateToApply).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <p className="text-sm whitespace-pre-wrap">{selectedCollege.description}</p>
                </div>
                <div>
                  <Label>Courses</Label>
                  <p className="text-sm whitespace-pre-wrap">{selectedCollege.courses}</p>
                </div>
                <div>
                  <Label>Apply Link</Label>
                  <a 
                    href={selectedCollege.applyLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {selectedCollege.applyLink}
                  </a>
                </div>
                {selectedCollege.tags && selectedCollege.tags.length > 0 && (
                  <div>
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedCollege.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewCollegeModalOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {isEditCollegeModalOpen && selectedCollege && (
          <Dialog open={isEditCollegeModalOpen} onOpenChange={setIsEditCollegeModalOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit College</DialogTitle>
                <DialogDescription>
                  Make changes to college information
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[80vh] overflow-y-auto pr-2">
                <Form {...collegeForm}>
                  <form onSubmit={collegeForm.handleSubmit(async (data) => {
                    try {
                      await updateDoc(doc(db, "colleges", selectedCollege.id), {
                        ...data,
                        updatedAt: new Date().toISOString()
                      });
                      setColleges(colleges.map(c => c.id === selectedCollege.id ? { ...c, ...data } : c));
                      toast.success("College updated successfully");
                      setIsEditCollegeModalOpen(false);
                    } catch (error) {
                      console.error("Error updating college:", error);
                      toast.error("Failed to update college");
                    }
                  })} className="space-y-6">
                    {/* Basic Info */}
                    <div>
                      <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-200">Basic Info</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={collegeForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>College Name</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || selectedCollege.name} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={collegeForm.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || selectedCollege.location} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={collegeForm.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Institution Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || selectedCollege.type}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select institution type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="public">Public</SelectItem>
                                  <SelectItem value="private">Private</SelectItem>
                                  <SelectItem value="community">Community College</SelectItem>
                                  <SelectItem value="technical">Technical Institute</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={collegeForm.control}
                          name="website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Website</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || selectedCollege.website || ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={collegeForm.control}
                          name="department"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Department</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || selectedCollege.department} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={collegeForm.control}
                          name="lastDateToApply"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Date to Apply</FormLabel>
                              <FormControl>
                                <Input 
                                  type="date" 
                                  {...field}
                                  value={field.value || (selectedCollege.lastDateToApply ? selectedCollege.lastDateToApply.split('T')[0] : '')}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    {/* Description */}
                    <div>
                      <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-200">Description</h4>
                      <FormField
                        control={collegeForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>About</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field}
                                value={field.value || selectedCollege.description}
                                className="min-h-[80px] md:min-h-[100px] resize-vertical" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {/* Courses */}
                    <div>
                      <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-200">Courses</h4>
                      <FormField
                        control={collegeForm.control}
                        name="courses"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Courses</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field}
                                value={field.value || selectedCollege.courses}
                                className="min-h-[80px] md:min-h-[100px] resize-vertical" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {/* Apply Link */}
                    <div>
                      <FormField
                        control={collegeForm.control}
                        name="applyLink"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Apply Link</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || selectedCollege.applyLink} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {/* Tags */}
                    <div>
                      <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-200">Tags</h4>
                      <FormField
                        control={collegeForm.control}
                        name="tags"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tags</FormLabel>
                            <div className="flex flex-wrap gap-3 mt-2">
                              {['Top Rated', 'Engineering', 'Medicine', 'Business'].map((tag) => (
                                <label key={tag} className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                                  <input
                                    type="checkbox"
                                    checked={field.value?.includes(tag) || false}
                                    onChange={() => {
                                      if (field.value?.includes(tag)) {
                                        field.onChange(field.value.filter((t: string) => t !== tag));
                                      } else {
                                        field.onChange([...(field.value || []), tag]);
                                      }
                                    }}
                                    className="accent-education-primary"
                                  />
                                  <span className="text-xs font-medium">{tag}</span>
                                </label>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsEditCollegeModalOpen(false)}>Cancel</Button>
                      <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Event Modals */}
        {isViewEventModalOpen && selectedEvent && (
          <Dialog open={isViewEventModalOpen} onOpenChange={setIsViewEventModalOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Event Details</DialogTitle>
                <DialogDescription>
                  View complete event information
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{selectedEvent.title}</h3>
                  <p className="text-sm text-muted-foreground">{selectedEvent.organizer}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date & Time</Label>
                    <p className="text-sm">{selectedEvent.date ? new Date(selectedEvent.date).toLocaleString() : ''}</p>
                  </div>
                  <div>
                    <Label>Location</Label>
                    <p className="text-sm">{selectedEvent.location}</p>
                  </div>
                  <div>
                    <Label>Type</Label>
                    <p className="text-sm">{selectedEvent.type}</p>
                  </div>
                  <div>
                    <Label>Apply Link</Label>
                    <a 
                      href={selectedEvent.applyLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {selectedEvent.applyLink}
                    </a>
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <p className="text-sm whitespace-pre-wrap">{selectedEvent.description}</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewEventModalOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        {isEditEventModalOpen && selectedEvent && (
          <Dialog open={isEditEventModalOpen} onOpenChange={setIsEditEventModalOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit Event</DialogTitle>
                <DialogDescription>
                  Make changes to event information
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[80vh] overflow-y-auto pr-2">
                <Form {...eventForm}>
                  <form onSubmit={eventForm.handleSubmit(async (data) => {
                    try {
                      await updateDoc(doc(db, "events", selectedEvent.id), {
                        ...data,
                        updatedAt: new Date().toISOString()
                      });
                      setEvents(events.map(e => e.id === selectedEvent.id ? { ...e, ...data } : e));
                      toast.success("Event updated successfully");
                      setIsEditEventModalOpen(false);
                    } catch (error) {
                      console.error("Error updating event:", error);
                      toast.error("Failed to update event");
                    }
                  })} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={eventForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Title</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || selectedEvent.title} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={eventForm.control}
                        name="organizer"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Organizer</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || selectedEvent.organizer} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={eventForm.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Date & Time</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} value={field.value || (selectedEvent.date ? selectedEvent.date.split('T')[0] + 'T' + (selectedEvent.date.split('T')[1] || '00:00') : '')} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={eventForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || selectedEvent.location} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={eventForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || selectedEvent.type}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select event type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="career-fair">Career Fair</SelectItem>
                                <SelectItem value="workshop">Workshop</SelectItem>
                                <SelectItem value="webinar">Webinar</SelectItem>
                                <SelectItem value="conference">Conference</SelectItem>
                                <SelectItem value="networking">Networking</SelectItem>
                                <SelectItem value="hackathon">Hackathon</SelectItem>
                                <SelectItem value="info-session">Info Session</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={eventForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} value={field.value || selectedEvent.description} className="min-h-[100px]" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={eventForm.control}
                      name="applyLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Apply Link</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || selectedEvent.applyLink} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsEditEventModalOpen(false)}>Cancel</Button>
                      <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>
        )}
        {/* Add College Modal for Completed Tab */}
        {isAddCollegeModalOpen && (
          <Dialog open={isAddCollegeModalOpen} onOpenChange={setIsAddCollegeModalOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add Completed College</DialogTitle>
                <DialogDescription>Add a new completed college</DialogDescription>
              </DialogHeader>
              <Form {...collegeForm}>
                <form onSubmit={collegeForm.handleSubmit(async (data) => {
                  await addDoc(firestoreCollection(db, "colleges"), {
                    ...data,
                    status: "completed",
                    createdAt: new Date().toISOString(),
                  });
                  toast.success("Completed college added");
                  setIsAddCollegeModalOpen(false);
                  collegeForm.reset();
                })} className="space-y-4">
                  {/* ... reuse college form fields ... */}
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddCollegeModalOpen(false)}>Cancel</Button>
                    <Button type="submit">Add College</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
        {/* Add Job Modal for Completed Tab */}
        {isAddJobModalOpen && (
          <Dialog open={isAddJobModalOpen} onOpenChange={setIsAddJobModalOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add Completed Job</DialogTitle>
                <DialogDescription>Add a new completed job</DialogDescription>
              </DialogHeader>
              <Form {...jobForm}>
                <form onSubmit={jobForm.handleSubmit(async (data) => {
                  await addDoc(firestoreCollection(db, "jobs"), {
                    ...data,
                    status: "completed",
                    createdAt: new Date().toISOString(),
                  });
                  toast.success("Completed job added");
                  setIsAddJobModalOpen(false);
                  jobForm.reset();
                })} className="space-y-4">
                  {/* ... reuse job form fields ... */}
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddJobModalOpen(false)}>Cancel</Button>
                    <Button type="submit">Add Job</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
        {/* Add Event Modal for Completed Tab */}
        {isAddEventModalOpen && (
          <Dialog open={isAddEventModalOpen} onOpenChange={setIsAddEventModalOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add Completed Event</DialogTitle>
                <DialogDescription>Add a new completed event</DialogDescription>
              </DialogHeader>
              <Form {...eventForm}>
                <form onSubmit={eventForm.handleSubmit(async (data) => {
                  await addDoc(firestoreCollection(db, "events"), {
                    ...data,
                    status: "completed",
                    createdAt: new Date().toISOString(),
                  });
                  toast.success("Completed event added");
                  setIsAddEventModalOpen(false);
                  eventForm.reset();
                })} className="space-y-4">
                  {/* ... reuse event form fields ... */}
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddEventModalOpen(false)}>Cancel</Button>
                    <Button type="submit">Add Event</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Admin;

