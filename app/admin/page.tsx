"use client";

import React, { useState, useEffect } from "react";
import { auth } from "@/lib/firebase/firebase"; // Pastikan path ke config firebase client Anda benar
import { onAuthStateChanged, getIdTokenResult } from "firebase/auth";
import { addMovieQuickly } from "@/app/actions/manage-movies";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LogoutButton from "@/components/logout/logout-button";

export default function AdminDashboard() {
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>("Memeriksa akses...");
  const [userEmail, setUserEmail] = useState<string | null>("");

  const router = useRouter();

  // 1. Ambil Data User & Custom Claims saat Komponen Mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserEmail(user.email);
        try {
          // Ambil token terbaru untuk melihat claims
          const tokenResult = await getIdTokenResult(user);

          if (tokenResult.claims.admin === true) {
            setUserRole("Administrator");
          } else {
            setUserRole("User Biasa");
            // Opsional: Redirect jika bukan admin
            // toast.error("Akses ditolak: Anda bukan admin");
            // router.push("/");
          }
        } catch (error) {
          console.error("Gagal mengambil claims:", error);
          setUserRole("Error Load Role");
        }
      } else {
        setUserRole(null);
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // 2. Handler Tambah Film
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await addMovieQuickly(title, link);

      if (result.success) {
        toast.success("Berhasil!", {
          description: `Film "${title}" telah ditambahkan ke database.`,
          icon: <i className="ri-checkbox-circle-fill text-green-500 text-lg"></i>,
        });
        setTitle("");
        setLink("");
      } else {
        toast.error("Gagal Menambahkan", {
          description: result.message,
          icon: <i className="ri-error-warning-fill text-red-500 text-lg"></i>,
        });
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6 flex flex-col items-center">
      {/* Header Admin */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-900/20">
            <i className="ri-dashboard-3-line text-white text-xl"></i>
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase leading-none">Admin Panel</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${userRole === "Administrator"
                ? "bg-green-500/10 text-green-400 border-green-500/30"
                : "bg-zinc-500/10 text-zinc-400 border-zinc-500/30"
                }`}>
                {userRole}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">{userEmail}</span>
            </div>
          </div>
        </div>
        <LogoutButton />
      </div>

      <div className="w-full max-w-2xl space-y-6">
        <Card className="bg-zinc-900 border-zinc-800 text-white shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <i className="ri-movie-add-line text-blue-500"></i> Input Film Baru
            </CardTitle>
            <CardDescription className="text-zinc-500">
              Sistem akan otomatis mengonversi link GDrive Anda menjadi streaming link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-zinc-400">Judul Film</Label>
                <Input
                  id="title"
                  placeholder="Masukkan judul film..."
                  className="bg-zinc-950 border-zinc-800 focus:border-blue-500 transition-all text-white h-11"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link" className="text-zinc-400">Link Google Drive</Label>
                <Input
                  id="link"
                  placeholder="Paste link sharing GDrive di sini..."
                  className="bg-zinc-950 border-zinc-800 focus:border-blue-500 transition-all text-white h-11"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 shadow-lg shadow-blue-900/20"
                disabled={loading || userRole !== "Administrator"}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <i className="ri-loader-5-line animate-spin text-lg"></i> Menyimpan...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <i className="ri-save-3-line text-lg"></i> Tambahkan ke Katalog
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Box */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
            <i className="ri-information-line text-blue-500"></i>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            <strong className="text-zinc-200 block mb-1">Penting:</strong>
            Pastikan file di Drive di-set ke <span className="text-blue-400 font-medium">"Siapa saja yang memiliki link"</span>.
            Jika tidak, video akan mengalami error 403 (Forbidden) saat diputar oleh user.
          </p>
        </div>
      </div>
    </div>
  );
}
