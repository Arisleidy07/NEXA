"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "@/lib/firebase";

interface UserProfile {
  nombre: string;
  email: string;
  fotoUrl?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserName: (name: string) => Promise<void>;
  updateUserPhoto: (file: File) => Promise<string>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});
googleProvider.addScope("profile");
googleProvider.addScope("email");

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Real-time listener for user profile in Firestore
  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      return;
    }
    const unsubProfile = onSnapshot(doc(db, "usuarios", user.uid), (snap) => {
      if (snap.exists()) {
        setUserProfile(snap.data() as UserProfile);
      }
    });
    return unsubProfile;
  }, [user]);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await setDoc(doc(db, "usuarios", cred.user.uid), {
      nombre: name,
      email: email,
      createdAt: new Date().toISOString(),
    });
  };

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const userDoc = await getDoc(doc(db, "usuarios", result.user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, "usuarios", result.user.uid), {
        nombre: result.user.displayName || "Mi Negocio",
        email: result.user.email,
        createdAt: new Date().toISOString(),
      });
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const updateUserName = async (name: string) => {
    if (!user) return;
    await updateProfile(user, { displayName: name });
    await setDoc(
      doc(db, "usuarios", user.uid),
      { nombre: name },
      { merge: true },
    );
  };

  const updateUserPhoto = async (file: File): Promise<string> => {
    if (!user) throw new Error("No user");
    const storageRef = ref(storage, `usuarios/${user.uid}/foto_perfil`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    await updateProfile(user, { photoURL: url });
    await setDoc(
      doc(db, "usuarios", user.uid),
      { fotoUrl: url },
      { merge: true },
    );
    return url;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        updateUserName,
        updateUserPhoto,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
