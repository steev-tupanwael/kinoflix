'use client'

import { User, onAuthStateChanged } from "firebase/auth";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { auth, db } from '@/lib/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { syncProfileCookie } from "@/app/login/actions";

// 1. Definisikan Tipe Role & User Session secara ketat
export type AppRole = 'admin' | 'user' | null;

interface AuthContextType {
  user: User | null;
  uid: string | null;       // Mudah diakses untuk createdBy/updatedBy
  userName: string | null;
  role: AppRole;
  permissions: string[];    // Daftar path yang diizinkan (allowedPaths)
  loading: boolean;
  refreshProfile: () => Promise<void>;
  hasPermission: (path: string) => boolean; // Fungsi cek akses halaman
}

// 2. Buat Context dengan nilai default
const AuthContext = createContext<AuthContextType>({
  user: null,
  uid: null,
  userName: null,
  role: null,
  permissions: [],
  loading: true,
  refreshProfile: async () => { },
  hasPermission: () => false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);

  /**
   * Menarik data profil terbaru dari Firestore
   * Digunakan saat login pertama kali atau refresh manual
   */
  const fetchLatestProfile = async (fbUser: User) => {
    try {
      const userDocRef = doc(db, 'users', fbUser.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const newRole = (data.role as AppRole) || 'user';
        const newPaths = data.allowedPaths || [];

        setRole(newRole);
        setPermissions(newPaths);
        setUserName(data.name || "");

        // Sinkronisasi data ke Cookie agar Middleware & Server Components mengenali role
        await syncProfileCookie({
          uid: fbUser.uid,
          name: data.name || "",
          email: data.email || "",
          photo: data.photo || "",
          role: newRole,
          allowedPaths: newPaths
        });
      }
    } catch (error) {
      console.error("Error fetching profile from Firestore:", error);
    }
  };

  /**
   * Fungsi untuk mengecek izin akses ke path tertentu secara dinamis
   */
  const hasPermission = (path: string): boolean => {
    // Admin memiliki akses ke segalanya
    if (role === 'admin') return true;

    // Jika data belum siap atau user tidak punya role, tolak akses
    if (!role || !permissions) return false;

    // Cek apakah path yang diminta dimulai dengan salah satu allowedPaths user
    return permissions.some(p => path.startsWith(p));
  };

  /**
   * Fungsi manual untuk memperbarui profil tanpa logout (Refresh Access)
   */
  const refreshProfile = async () => {
    if (user) {
      setLoading(true);
      await fetchLatestProfile(user);
      setLoading(false);
    }
  };

  /**
   * Listener status autentikasi Firebase
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setLoading(true);
      if (fbUser) {
        setUser(fbUser);
        await fetchLatestProfile(fbUser);
      } else {
        setUser(null);
        setRole(null);
        setPermissions([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        uid: user?.uid || null,
        userName,
        role,
        permissions,
        loading,
        refreshProfile,
        hasPermission
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 3. Hook custom untuk memudahkan pemanggilan di komponen lain
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
