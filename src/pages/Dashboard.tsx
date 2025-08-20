import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHome from "@/components/dashboard/DashboardHome";
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card } from "@/components/ui/card";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        setUserData(userDoc.exists() ? userDoc.data() : null);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <DashboardLayout><div className="p-8 text-center">Loading dashboard...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <DashboardHome />
      <Card className="hover:shadow-xl transition-shadow duration-300 border-0 bg-card text-card-foreground rounded-2xl overflow-hidden flex flex-col h-full">
        {/* ... */}
      </Card>
    </DashboardLayout>
  );
};

export default Dashboard;
