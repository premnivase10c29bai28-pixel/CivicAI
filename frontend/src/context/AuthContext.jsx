import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext();

export function formatAuthError(error) {
  if (!error) return "An unexpected error occurred.";
  
  if (
    error.code === "firestore/profile-save-failed" ||
    error.message?.includes("Account created, but your profile could not be saved")
  ) {
    return "Account created, but your profile could not be saved. Please try again.";
  }
  
  if (error.code === "permission-denied") {
    return "Account created, but your profile could not be saved due to insufficient permissions. Please check Firestore security rules.";
  }

  const code = error.code || "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Invalid email or password. Please verify your credentials.";
    case "auth/email-already-in-use":
      return "An account with this email address already exists.";
    case "auth/weak-password":
      return "Password should be at least 6 characters long.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/network-request-failed":
      return "Network connection issue. Please check your internet connectivity.";
    case "auth/too-many-requests":
      return "Too many unsuccessful attempts. Please wait a moment and try again.";
    default:
      return error.message || "Authentication failed. Please try again.";
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user profile from Firestore users/{uid}
  const loadUserProfile = async (uid, fallbackUser) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserProfile(data);
        return data;
      } else {
        const isAuthorityEmail = 
          fallbackUser?.email?.includes("gov") || 
          fallbackUser?.email?.includes("commissioner") ||
          fallbackUser?.email?.includes("authority");

        const initialProfile = {
          userId: uid,
          name: fallbackUser?.displayName || (isAuthorityEmail ? "Municipal Officer" : "Resident Citizen"),
          email: fallbackUser?.email || "",
          phone: "+91 98401 23456",
          role: isAuthorityEmail ? "authority" : "citizen",
          language: "Tamil",
          district: isAuthorityEmail ? "Greater Municipal Region" : "Chennai South",
          createdAt: new Date().toISOString()
        };

        setUserProfile(initialProfile);
        return initialProfile;
      }
    } catch (err) {
      console.error("Error reading Firestore profile users/" + uid + ":", err);
      // Fallback profile to prevent app crash
      const fallbackProfile = {
        userId: uid,
        name: fallbackUser?.displayName || fallbackUser?.email?.split("@")[0] || "Citizen",
        email: fallbackUser?.email || "",
        role: "citizen",
        language: "English",
        district: "Chennai South",
        createdAt: new Date().toISOString()
      };
      setUserProfile(fallbackProfile);
      return fallbackProfile;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await loadUserProfile(user.uid, user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Email & Password Registration (Role is strictly fixed to 'citizen')
  const register = async (params) => {
    const {
      email,
      password,
      name,
      fullName,
      phone,
      language,
      preferredLanguage,
      district
    } = params || {};

    const resolvedName = (name || fullName || "").trim() || "Resident Citizen";
    const resolvedPhone = (phone || "").trim();
    const resolvedLanguage = language || preferredLanguage || "Tamil";
    const resolvedDistrict = district || "Chennai South";

    // 1. Authenticate with Firebase Auth
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;

    // 2. Update display name in Firebase Auth
    try {
      await updateFirebaseProfile(user, { displayName: resolvedName });
    } catch (e) {
      console.warn("Could not update displayName:", e);
    }

    // 3. Create Firestore document users/{user.uid}
    const newProfile = {
      userId: user.uid,
      name: resolvedName,
      email: user.email || email,
      phone: resolvedPhone,
      role: "citizen",
      language: resolvedLanguage,
      district: resolvedDistrict,
      createdAt: serverTimestamp()
    };

    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, newProfile);

      setUserProfile({
        ...newProfile,
        createdAt: new Date().toISOString()
      });

      return { user, profile: newProfile };
    } catch (firestoreErr) {
      console.error("Firestore user profile creation failed for users/" + user.uid + ":", firestoreErr);
      const customErr = new Error("Account created, but your profile could not be saved. Please try again.");
      customErr.code = "firestore/profile-save-failed";
      customErr.originalError = firestoreErr;
      throw customErr;
    }
  };

  // Email & Password Login
  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const profile = await loadUserProfile(userCredential.user.uid, userCredential.user);
    return { user: userCredential.user, profile };
  };

  // Sign out
  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setUserProfile(null);
  };

  // Update profile fields (Strictly updates users/{authenticatedUser.uid})
  const updateUserProfileData = async (updatedFields) => {
    const authUser = auth.currentUser;
    if (!authUser) {
      throw new Error("Cannot update profile: No user is currently signed in.");
    }
    
    // Safety check: Never allow user to change their role, userId, or email through UI
    const safeData = { ...updatedFields };
    delete safeData.role;
    delete safeData.userId;
    delete safeData.email;
    safeData.updatedAt = serverTimestamp();

    const userRef = doc(db, "users", authUser.uid);
    try {
      await updateDoc(userRef, safeData);
      setUserProfile((prev) => ({
        ...prev,
        ...safeData
      }));
    } catch (err) {
      console.error("Firestore updateUserProfileData failed for users/" + authUser.uid + ":", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        role: userProfile?.role || "citizen",
        isAuthenticated: !!currentUser,
        loading,
        register,
        login,
        logout,
        updateUserProfileData,
        formatAuthError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
