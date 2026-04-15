"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter, useParams, usePathname } from "next/navigation";
import {
  RiArrowLeftLine,
  RiAddLine,
  RiInformationLine,
  RiVipCrown2Line,
  RiLoader4Line,
  RiPlayFill,
  RiUser3Line,
  RiLockPasswordLine
} from "@remixicon/react";

// Firebase & Actions
import { db, auth } from "@/lib/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getAuthorizedMovieUrl } from "@/app/actions/movie-access";
import { doc, getDoc } from "firebase/firestore";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import "plyr/dist/plyr.css";

// Dynamic Import Plyr (Client Only)
const Plyr = dynamic<{ source: any; options?: any }>(
  () => import("plyr-react").then((mod) => mod.Plyr),
  {
    ssr: false,
    loading: () => <div className="aspect-video bg-zinc-900 animate-pulse rounded-[2.5rem]" />
  }
);

export default function WatchPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const movieId = params.id as string;

  // States
  const [movie, setMovie] = useState<any>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  /**
   * errorType logic:
   * "AUTH"    -> User belum login (untuk film premium)
   * "PAYMENT" -> User sudah login tapi tidak punya status Pro
   */
  const [errorType, setErrorType] = useState<"AUTH" | "PAYMENT" | null>(null);

  // 1. Monitor Status Autentikasi
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch Data Film & Validasi Akses
  useEffect(() => {
    const fetchMovieData = async () => {
      if (!movieId) return;

      try {
        setLoading(true);
        const docRef = doc(db, "movies", movieId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          router.replace("/");
          return;
        }

        const movieData = docSnap.data();
        setMovie(movieData);

        // LOGIKA AKSES
        if (movieData.isPremium) {
          // A. Cek jika belum login
          if (!auth.currentUser) {
            setErrorType("AUTH");
            setLoading(false);
            return;
          }

          // B. Jika sudah login, cek izin via Server Action (Firebase Admin + Supabase Signed URL)
          const result = await getAuthorizedMovieUrl(auth.currentUser.uid, movieId);

          if (result.url) {
            setVideoSrc(result.url);
            setErrorType(null);
          } else {
            setErrorType("PAYMENT");
          }
        } else {
          // C. Film Gratis: Langsung set URL dari Firestore
          setVideoSrc(movieData.videoUrl);
          setErrorType(null);
        }
      } catch (error) {
        console.error("WatchPage Error:", error);
      } finally {
        setLoading(false);
      }
    };

    // Kita jalankan fetch setiap kali movieId atau status userId berubah
    fetchMovieData();
  }, [movieId, userId, router]);

  // Handlers
  const handleLoginRedirect = () => {
    router.push(`/login?redirect=${pathname}`);
  };

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <RiLoader4Line className="animate-spin text-white/20" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">

      {/* --- SECTION 1: STICKY PLAYER & NAV --- */}
      <div className="sticky top-0 z-50 bg-black">
        <nav className="w-full p-4 md:p-6 flex items-center justify-between bg-gradient-to-b from-black to-transparent">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-white hover:bg-white/10 gap-3 px-4 rounded-full transition-all"
          >
            <RiArrowLeftLine size={24} />
            <span className="text-lg font-medium tracking-tight">Kembali</span>
          </Button>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${errorType === 'PAYMENT' ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-white/5 border-white/5'}`}>
            <RiVipCrown2Line className={errorType === 'PAYMENT' ? 'text-yellow-500' : 'text-zinc-500'} size={18} />
            <span className="text-[10px] font-black tracking-[0.2em] text-zinc-300 uppercase">KINOFLIX PRO</span>
          </div>
        </nav>

        {/* Video Player Container */}
        <div className="px-4 md:px-12 pb-6">
          <div className="w-full max-w-7xl mx-auto relative group/player">
            <div className="relative w-full aspect-video md:aspect-21/9 overflow-hidden bg-zinc-900 rounded-[2rem] border border-white/5 shadow-2xl">

              {/* Conditional Rendering: Player vs Paywall */}
              {!errorType && videoSrc ? (
                <div className="apple-plyr-container h-full w-full">
                  <Plyr
                    key={videoSrc} // Reset player jika source berubah
                    source={{
                      type: 'video',
                      sources: [{ src: videoSrc, type: 'video/mp4' }],
                    }}
                    options={{
                      autoplay: true,
                      controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
                    }}
                  />
                </div>
              ) : (
                /* Paywall / Error State UI */
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 text-center">
                  {errorType === "AUTH" ? (
                    <div className="animate-in fade-in zoom-in duration-500">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 mx-auto border border-white/10">
                        <RiUser3Line size={40} className="text-white/40" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter mb-2">Akses Terkunci</h2>
                      <p className="text-zinc-500 mb-8 max-w-sm mx-auto">Silahkan masuk ke akun Kinoflix Anda untuk menonton film premium ini.</p>
                      <Button onClick={handleLoginRedirect} className="bg-white text-black hover:bg-zinc-200 px-10 h-14 rounded-2xl font-black text-lg transition-transform active:scale-95">
                        LOGIN SEKARANG
                      </Button>
                    </div>
                  ) : (
                    <div className="animate-in fade-in zoom-in duration-500">
                      <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6 mx-auto border border-yellow-500/20">
                        <RiVipCrown2Line size={40} className="text-yellow-500" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter mb-2">Upgrade ke Pro</h2>
                      <p className="text-zinc-500 mb-8 max-w-sm mx-auto">Film ini eksklusif untuk member Pro. Langganan sekarang untuk akses tanpa batas.</p>
                      <Button onClick={() => router.push('/pricing')} className="bg-yellow-500 text-black hover:bg-yellow-400 px-10 h-14 rounded-2xl font-black text-lg shadow-[0_0_30px_rgba(234,179,8,0.3)] transition-transform active:scale-95">
                        BERLANGGANAN PRO
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* --- SECTION 2: MOVIE INFO (SCROLLABLE) --- */}
      <main className="flex-1 px-4 md:px-12 pt-10 pb-32">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 px-4 md:px-8">

          {/* Kolom Kiri: Deskripsi */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="bg-red-600 text-white font-black text-[10px] px-2 tracking-widest border-none">4K HDR</Badge>
                <Badge variant="outline" className="border-white/20 text-white/60 text-[10px] uppercase font-bold tracking-widest px-2">
                  {movie?.quality || 'Full HD'}
                </Badge>
                <span className="text-zinc-500 font-bold text-sm">• {movie?.year}</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.9]">
                {movie?.title}
              </h1>

              <div className="flex items-center gap-3 text-zinc-400 font-medium text-base">
                <span>{Array.isArray(movie?.genre) ? movie.genre.join(" • ") : movie?.genre}</span>
                <span className="opacity-20">|</span>
                <span>{movie?.duration || '2j 14m'}</span>
              </div>
            </div>

            <p className="text-zinc-400 text-lg md:text-xl leading-relaxed font-light max-w-4xl">
              {movie?.description}
            </p>

            {/* Cast & Crew Placeholder */}
            <div className="pt-10 space-y-8">
              <h3 className="text-xl font-bold tracking-tight text-white/50 uppercase">Pemeran Utama</h3>
              <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex-shrink-0 flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 min-w-[200px]">
                    <div className="w-12 h-12 rounded-full bg-zinc-800" />
                    <div>
                      <p className="font-bold text-sm">Talent {i}</p>
                      <p className="text-xs text-zinc-500">Pemeran</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Actions */}
          <div className="flex flex-col gap-4">
            <Button
              size="lg"
              className="rounded-2xl bg-white text-black hover:bg-zinc-200 h-16 font-black text-xl shadow-xl transition-all active:scale-[0.98] flex gap-3"
              disabled={!!errorType}
            >
              <RiPlayFill size={28} />
              {errorType ? 'TERKUNCI' : 'LANJUTKAN'}
            </Button>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-2xl h-14 border-white/10 bg-white/5 hover:bg-white/10 gap-2 font-bold tracking-tight">
                <RiAddLine size={20} />
                DAFTAR SAYA
              </Button>
              <Button variant="outline" size="icon" className="rounded-2xl h-14 w-14 border-white/10 bg-white/5 hover:bg-white/10">
                <RiInformationLine size={20} />
              </Button>
            </div>
          </div>

        </div>
      </main>

      <style jsx global>{`
        .apple-plyr-container .plyr {
          height: 100% !important;
          width: 100% !important;
          --plyr-color-main: #3b82f6;
        }
        .plyr--video {
          background: #000;
          border-radius: 2rem;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
