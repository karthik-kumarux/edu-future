import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";



export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function getEmailsForRecipient(
  recipient: string,
  educationLevel?: string
): Promise<string[]> {
  const emails: string[] = [];

  const usersSnapshot = await getDocs(collection(db, "users"));
  usersSnapshot.forEach(doc => {
    const user = doc.data();
    if (!user.email) return;

    if (recipient === "all") {
      emails.push(user.email);
    }

    if (recipient === "students") {
      const level = (user.educationLevel || "").toLowerCase().replace(/[\s.-]/g, "");
      const selected = (educationLevel || "").toLowerCase().replace(/[\s.-]/g, "");
      if (selected === "all" && level) {
        emails.push(user.email);
      } else if (selected && level === selected) {
        emails.push(user.email);
      }
    }
  });

  return emails;
}