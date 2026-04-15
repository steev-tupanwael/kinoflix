'use client'

import { User, onAuthStateChanged } from "firebase/auth";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { auth, db } from '@/lib/firebase/firebase'
import { doc, onSnapshot } from 'firebase/firestore'
import { syncProfileCookie } from "@/app/login/actions";

interface AuthContextType {
  user: User | null;
  role: 'admin' | 'user' | null;
  permissions: string[];
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  permissions: [],
  loading: true,
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<'admin' | 'user' | null>(null)
  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Gunakan Ref untuk menyimpan data terakhir guna perbandingan (mencegah loop)
  const lastDataRef = useRef<string>("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setUser(fbUser)

        const userDocRef = doc(db, 'users', fbUser.uid)
        const unsubDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();

            // 1. Buat string pembanding (UID + Role + Permissions)
            const currentDataString = JSON.stringify({
              role: data.role,
              paths: data.allowedPaths,
              email: data.email
            });

            // 2. CEK: Jika data sama dengan sebelumnya, JANGAN lakukan apapun!
            if (lastDataRef.current === currentDataString) {
              setLoading(false);
              return;
            }

            // 3. Jika berbeda, barulah update state dan sync cookie
            lastDataRef.current = currentDataString;

            const newRole = data.role || 'user';
            const newPaths = data.allowedPaths || [];

            setRole(newRole);
            setPermissions(newPaths);

            // Jalankan syncProfileCookie hanya jika data benar-benar berubah
            syncProfileCookie({
              uid: fbUser.uid,
              name: data.name || "",
              email: data.email || "",
              photo: data.photo || "",
              role: newRole,
              allowedPaths: newPaths,
            });
          } else {
            setRole('user');
            setPermissions([]);
          }
          setLoading(false);
        }, (error) => {
          console.error("Firestore error:", error);
          setLoading(false);
        });

        return () => unsubDoc();
      } else {
        setUser(null);
        setRole(null);
        setPermissions([]);
        lastDataRef.current = ""; // Reset ref saat logout
        setLoading(false);
      }
    });

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, role, permissions, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
