import { useState, ReactNode, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Home, 
  Search, 
  User, 
  Calendar, 
  Bell, 
  LogOut,
  Menu,
  X,
  Settings,
  School,
  Briefcase,
  Users
} from "lucide-react";
import ThemeToggle from "../ThemeToggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
  admin?: boolean;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const navigate = useNavigate();

  const mainNavItems: NavItem[] = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: School, label: "Colleges", href: "/colleges" },
    { icon: Calendar, label: "Events", href: "/events" },
    { icon: Briefcase, label: "Jobs", href: "/jobs" },
    // { icon: Search, label: "College Explorer", href: "/dashboard/explore" },
  ];
  
  const accountNavItems: NavItem[] = [
    { icon: User, label: "Profile", href: "/dashboard/profile" },
    { icon: Users, label: "Admin", href: "/admin", admin: true },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const isLinkActive = (href: string) => {
    return location.pathname === href;
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsAdmin(user?.email === "guidmenext5@gmail.com");
      setUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        setUserData(userDoc.exists() ? userDoc.data() : {});
      } else {
        setUserData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-background/90 sticky top-0 z-50">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          {isSidebarOpen ? <X /> : <Menu />}
        </Button>
        <Link to="/" className="flex items-center gap-2">
          <img
                src="../gude.png"  // Replace with your image path
                alt="Logo"
                className="h-7 w-7 rounded-full object-cover"
              />
          <span className="text-xl font-display font-semibold">GUIDMENEXT</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm mr-2">{userData?.firstName} {userData?.lastName}</span>
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-education-error rounded-full"></span>
          </Button>
          <Avatar className="h-9 w-9">
            <AvatarImage src={userData?.avatar || user?.photoURL || undefined} />
            <AvatarFallback>{(userData?.firstName || "U").substring(0,1)}{(userData?.lastName || "").substring(0,1)}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Sidebar for Mobile (Overlay) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={toggleSidebar}></div>
          <nav className="absolute top-0 left-0 bottom-0 w-64 bg-card border-r border-border p-4 shadow-xl animate-in slide-in-from-left">
            <div className="flex items-center justify-between mb-8">
              <Link to="/" className="flex items-center gap-2">
                <img
                src="../gude.png"  // Replace with your image path
                alt="Logo"
                className="h-7 w-7 rounded-full object-cover"
              />
                <span className="text-xl font-display font-semibold">GUIDMENEXT</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <ScrollArea className="h-[calc(100vh-8rem)]">
              <div className="space-y-8">
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4 px-2">
                    Main Menu
                  </h3>
                  <ul className="space-y-1">
                    {mainNavItems.map((item, index) => (
                      <li key={index}>
                        <Link
                          to={item.href}
                          className={`flex items-center gap-3 px-2 py-2 rounded-md transition-colors ${
                            isLinkActive(item.href) 
                              ? "bg-muted text-foreground" 
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                          onClick={toggleSidebar}
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.label}</span>
                          {item.badge && (
                            <Badge className="ml-auto bg-education-primary">
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4 px-2">
                    Account
                  </h3>
                  <ul className="space-y-1">
                    {accountNavItems.filter(item => !item.admin || isAdmin).map((item, index) => (
                      <li key={index}>
                        <Link
                          to={item.href}
                          className={`flex items-center gap-3 px-2 py-2 rounded-md transition-colors ${
                            isLinkActive(item.href) 
                              ? "bg-muted text-foreground" 
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                          onClick={toggleSidebar}
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.label}</span>
                          {item.admin && (
                            <Badge variant="secondary" className="ml-auto">
                              Admin
                            </Badge>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </ScrollArea>

            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between mb-4">
                <ThemeToggle />
                <Link
                  to="/logout"
                  className="w-full flex items-center gap-2 text-muted-foreground hover:text-foreground justify-start rounded-md px-2 py-2 transition-colors"
                  style={{ textDecoration: 'none' }}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Link>
              </div>
            </div>
          </nav>
        </div>
      )}

      {/* Desktop Layout */}
      <div className="md:grid md:grid-cols-[240px_1fr] h-screen">
        {/* Sidebar for Desktop */}
        <aside className="hidden md:flex flex-col border-r border-border bg-card">
          <div className="p-4">
            <Link to="/" className="flex items-center gap-2 mb-8">
              <img
                src="../gude.png"  // Replace with your image path
                alt="Logo"
                className="h-7 w-7 rounded-full object-cover"
              />
              <span className="text-xl font-display font-semibold">GUIDMENEXT</span>
            </Link>
            <div className="flex items-center gap-3 mb-6 min-w-0">
              <Avatar className="h-10 w-10">
                <AvatarImage src={userData?.avatar || user?.photoURL || undefined} />
                <AvatarFallback>{(userData?.firstName || "U").substring(0,1)}{(userData?.lastName || "").substring(0,1)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <p className="font-medium text-sm truncate w-32 md:w-40 lg:w-52 xl:w-64" title={userData?.firstName + ' ' + userData?.lastName}>{userData?.firstName} {userData?.lastName}</p>
                <p className="text-xs text-muted-foreground truncate w-32 md:w-40 lg:w-52 xl:w-64" title={userData?.email || user?.email || '-'}>{userData?.email || user?.email || "-"}</p>
              </div>
              <ThemeToggle />
            </div>

            <div className="space-y-8">
              <div>
               
                <ul className="space-y-1">
                  {mainNavItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        to={item.href}
                        className={`flex items-center gap-3 px-2 py-2 rounded-md transition-colors ${
                          isLinkActive(item.href) 
                            ? "bg-muted text-foreground" 
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                        {item.badge && (
                          <Badge className="ml-auto bg-education-primary">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4 px-2">
                  Account
                </h3>
                <ul className="space-y-1">
                  {accountNavItems.filter(item => !item.admin || isAdmin).map((item, index) => (
                    <li key={index}>
                      <Link
                        to={item.href}
                        className={`flex items-center gap-3 px-2 py-2 rounded-md transition-colors ${
                          isLinkActive(item.href) 
                            ? "bg-muted text-foreground" 
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                        {item.admin && (
                          <Badge variant="secondary" className="ml-auto">
                            Admin
                          </Badge>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-auto p-4 border-t border-border">
            <Link
              to="/logout"
              className="w-full flex items-center gap-2 text-muted-foreground hover:text-foreground justify-start rounded-md px-2 py-2 transition-colors"
              style={{ textDecoration: 'none' }}
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="md:h-screen overflow-auto">
          {/* Page Content */}
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

