import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAuth, onAuthStateChanged, updateEmail, updateProfile, updatePassword } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { motion } from "framer-motion";
import { Eye, EyeOff, X, CheckCircle2 } from "lucide-react";
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useToast } from "@/components/ui/use-toast";
import { Toast, ToastDescription, ToastTitle } from "@/components/ui/toast";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  age: string;
  gender: string;
  state: string;
  city: string;
  educationLevel: string;
  avatar: string;
}

interface FormErrors {
  phoneNumber?: string;
  age?: string;
}

const states = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const educationLevels = [
  "10th",
  "Intermediate",
  "Diploma",
  "B.A",
  "B.Com",
  "B.Sc",
  "B.Tech",
  "MBBS",
  "B.Ed",
  "D.El.Ed",
  "BFA",
  "B.Des",
  "LLB",
  "M.A",
  "M.Com",
  "M.Sc",
  "M.Tech",
  "MD",
  "MS",
  "MBA",
  "Ph.D"
];

const eventTypes = [
  "Workshop",
  "Seminar",
  "Webinar",
  "Conference",
  "Other"
];

// Add image compression utility
const compressImage = async (file: File, maxWidth: number = 800, maxHeight: number = 800): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions while maintaining aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to blob with reduced quality
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        0.8 // 80% quality
      );
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
  });
};

const Profile = () => {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    age: "",
    gender: "",
    state: "",
    city: "",
    educationLevel: "",
    avatar: ""
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5
  });
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        const data = userDoc.exists() ? userDoc.data() : {};
        setUserData(data);
        setForm({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || firebaseUser.email || "",
          phoneNumber: data.phoneNumber || "",
          age: data.age || "",
          gender: data.gender || "",
          state: data.state || "",
          city: data.city || "",
          educationLevel: data.educationLevel || "",
          avatar: data.avatar || firebaseUser.photoURL || ""
        });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (form.phoneNumber && !/^\d{10}$/.test(form.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid 10-digit phone number";
    }
    if (form.age && (isNaN(Number(form.age)) || Number(form.age) < 1 || Number(form.age) > 120)) {
      newErrors.age = "Please enter a valid age";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !validateForm()) return;
    
    setSaving(true);
    try {
      // Update profile
      await updateProfile(user, {
        displayName: `${form.firstName} ${form.lastName}`.trim(),
        photoURL: form.avatar || null
      });

      // Update email if changed
      if (user.email !== form.email) {
        await updateEmail(user, form.email);
      }

      // Update Firestore document
      await updateDoc(doc(db, "users", user.uid), {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        age: form.age,
        gender: form.gender,
        state: form.state,
        city: form.city,
        educationLevel: form.educationLevel,
        avatar: form.avatar || null,
        updatedAt: new Date().toISOString()
      });

      setUserData(prev => ({ ...prev, ...form }));
      toast({
        title: "Success!",
        description: "Your profile has been updated successfully.",
        className: "bg-green-50 border-green-200 text-green-900 dark:bg-green-900 dark:border-green-700 dark:text-green-100",
        duration: 3000,
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile: " + error.message,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  const validateImage = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      setUploadError('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return false;
    }

    if (file.size > maxSize) {
      setUploadError('Image size should be less than 5MB');
      return false;
    }

    return true;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadError(null);
    
    if (!validateImage(file)) {
      e.target.value = ''; // Reset input
      return;
    }

    try {
      // Compress image before showing crop modal
      const compressedBlob = await compressImage(file);
      const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' });
      
      // Read the compressed file
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setShowCropModal(true);
      };
      reader.onerror = () => {
        setUploadError('Failed to read the image file');
        e.target.value = ''; // Reset input
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      setUploadError(error.message || 'Failed to process image');
      e.target.value = ''; // Reset input
    }
  };

  const getCroppedImg = (image: HTMLImageElement, crop: Crop): Promise<string> => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Canvas is empty');
        }
        resolve(URL.createObjectURL(blob));
      }, 'image/jpeg');
    });
  };

  const handleCropComplete = async () => {
    if (!imgRef.current || !imageSrc || !user) return;

    try {
      setUploading(true);
      setUploadError(null);
      
      const croppedImageUrl = await getCroppedImg(imgRef.current, crop);
      
      // Convert the cropped image URL to a Blob
      const response = await fetch(croppedImageUrl);
      if (!response.ok) throw new Error('Failed to process the image');
      
      const blob = await response.blob();

      // Create a unique filename with timestamp and random string
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const filename = `${user.uid}_${timestamp}_${randomString}.jpg`;

      // Upload to Firebase Storage with optimized settings
      const storageRef = ref(storage, `avatars/${filename}`);
      const metadata = {
        contentType: 'image/jpeg',
        cacheControl: 'public,max-age=31536000',
        customMetadata: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      };
      
      try {
        const snapshot = await uploadBytes(storageRef, blob, metadata);
        const url = await getDownloadURL(snapshot.ref);
        
        // Update profile immediately
        await updateProfile(user, {
          photoURL: url
        });
        
        // Update Firestore document
        await updateDoc(doc(db, "users", user.uid), {
          avatar: url,
          updatedAt: new Date().toISOString()
        });
        
        setForm(prev => ({ ...prev, avatar: url }));
        setShowCropModal(false);
        setImageSrc(null);
        
        toast({
          title: "Success!",
          description: "Profile image uploaded successfully.",
          className: "bg-green-50 border-green-200 text-green-900 dark:bg-green-900 dark:border-green-700 dark:text-green-100",
          duration: 3000,
        });
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Failed to upload image. Please try again.');
      }
    } catch (error) {
      console.error('Error in handleCropComplete:', error);
      setUploadError(error.message || 'Failed to upload image');
      toast({
        title: "Error",
        description: "Failed to upload image: " + error.message,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!user) return;
    
    try {
      setUploading(true);
      setUploadError(null);
      
      // Remove from Firebase Storage if exists
      if (form.avatar && form.avatar.includes('firebasestorage.googleapis.com')) {
        try {
          const storageRef = ref(storage, form.avatar);
          await deleteObject(storageRef);
        } catch (deleteError) {
          console.error('Delete error:', deleteError);
          // Continue with profile update even if storage delete fails
        }
      }
      
      // Update profile
      await updateProfile(user, {
        photoURL: null
      });
      
      // Update Firestore document
      await updateDoc(doc(db, "users", user.uid), {
        avatar: null,
        updatedAt: new Date().toISOString()
      });
      
      setForm(prev => ({ ...prev, avatar: "" }));
      
      toast({
        title: "Success!",
        description: "Profile image removed successfully.",
        className: "bg-green-50 border-green-200 text-green-900 dark:bg-green-900 dark:border-green-700 dark:text-green-100",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error in handleRemoveImage:', error);
      setUploadError(error.message || 'Failed to remove image');
      toast({
        title: "Error",
        description: "Failed to remove image: " + error.message,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <DashboardLayout><div className="p-8 text-center">Loading profile...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="container max-w-4xl">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl">Profile Details</CardTitle>
                <CardDescription>View and manage your profile information</CardDescription>
              </div>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "outline" : "default"}
                className="gap-2"
              >
                {isEditing ? (
                  <>
                    <X className="h-4 w-4" />
                    Cancel Editing
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit Profile
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile Picture Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <Avatar className="h-32 w-32 border-4 border-background shadow-lg transition-transform group-hover:scale-105">
                    <AvatarImage src={form.avatar} />
                    <AvatarFallback className="text-2xl">{form.firstName.substring(0, 1)}{form.lastName.substring(0, 1)}</AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="bg-education-primary text-white p-2 rounded-full shadow-lg hover:bg-education-secondary transition-colors">
                        {uploading ? (
                          <svg className="h-5 w-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                        )}
                      </div>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                {form.avatar && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveImage}
                    disabled={uploading}
                    className="gap-2"
                  >
                    {uploading ? (
                      <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                    {uploading ? "Removing..." : "Remove Image"}
                  </Button>
                )}
                {uploadError && (
                  <p className="text-red-500 text-xs mt-1">{uploadError}</p>
                )}
                {uploading && !uploadError && (
                  <span className="text-xs text-muted-foreground">Processing...</span>
                )}
              </div>

              {/* Profile Details Section */}
              <div className="flex-1">
                {!isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground">Full Name</h3>
                      <p className="text-lg font-semibold">{form.firstName} {form.lastName}</p>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                      <p className="text-lg">{form.email}</p>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground">Phone Number</h3>
                      <p className="text-lg">{form.phoneNumber || "Not provided"}</p>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground">Age</h3>
                      <p className="text-lg">{form.age || "Not provided"}</p>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground">Gender</h3>
                      <p className="text-lg">{form.gender || "Not provided"}</p>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                      <p className="text-lg">
                        {form.city && form.state ? `${form.city}, ${form.state}` : "Not provided"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground">Education Level</h3>
                      <p className="text-lg">{form.educationLevel || "Not provided"}</p>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground">Member Since</h3>
                      <p className="text-lg">{userData?.joined || "-"}</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* First Name */}
                      <div>
                        <label className="block text-sm font-medium mb-1">First Name</label>
                        <Input
                          name="firstName"
                          value={form.firstName}
                          onChange={handleChange}
                          required
                          placeholder="Enter your first name"
                        />
                      </div>

                      {/* Last Name */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Last Name</label>
                        <Input
                          name="lastName"
                          value={form.lastName}
                          onChange={handleChange}
                          required
                          placeholder="Enter your last name"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <Input
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          required
                          placeholder="Enter your email"
                        />
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Phone Number</label>
                        <Input
                          name="phoneNumber"
                          value={form.phoneNumber}
                          onChange={handleChange}
                          placeholder="Enter your phone number"
                        />
                        {errors.phoneNumber && (
                          <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
                        )}
                      </div>

                      {/* Age */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Age</label>
                        <Input
                          name="age"
                          type="number"
                          value={form.age}
                          onChange={handleChange}
                          placeholder="Enter your age"
                        />
                        {errors.age && (
                          <p className="text-red-500 text-xs mt-1">{errors.age}</p>
                        )}
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Gender</label>
                        <Select value={form.gender} onValueChange={value => setForm(prev => ({ ...prev, gender: value }))}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* State */}
                      <div>
                        <label className="block text-sm font-medium mb-1">State</label>
                        <Select value={form.state} onValueChange={value => setForm(prev => ({ ...prev, state: value }))}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select State" />
                          </SelectTrigger>
                          <SelectContent>
                            {states.map(state => (
                              <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* City */}
                      <div>
                        <label className="block text-sm font-medium mb-1">City</label>
                        <Input
                          name="city"
                          value={form.city}
                          onChange={handleChange}
                          placeholder="Enter your city"
                        />
                      </div>

                      {/* Education Level */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Education Level</label>
                        <Select value={form.educationLevel} onValueChange={value => setForm(prev => ({ ...prev, educationLevel: value }))}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Education Level" />
                          </SelectTrigger>
                          <SelectContent>
                            {educationLevels.map(level => (
                              <SelectItem key={level} value={level}>{level}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={saving}
                      >
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Crop Modal */}
        {showCropModal && imageSrc && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-4 max-w-lg w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Crop Profile Picture</h3>
                <button
                  onClick={() => {
                    setShowCropModal(false);
                    setImageSrc(null);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
            </div>
              <div className="max-h-[60vh] overflow-auto">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  aspect={1}
                  circularCrop
                >
                  <img
                    ref={imgRef}
                    src={imageSrc}
                    alt="Crop preview"
                    className="max-w-full"
                  />
                </ReactCrop>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCropModal(false);
                    setImageSrc(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCropComplete}
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Crop & Upload"}
                </Button>
                </div>
            </div>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default Profile;
