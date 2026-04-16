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
} from "@remixicon/react";

import { db, auth } from "@/lib/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getAuthorizedMovieUrl } from "@/app/actions/movie-access";
import { doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import "plyr/dist/plyr.css";

// Fix 1: Pastikan Plyr benar-benar hanya di-load di client dengan wrapper div
const Plyr = dynamic<{ source: any; options?: any }>(
  () => import("plyr-react").then((mod) => mod.Plyr),
  {
    ssr: false,
    loading: () => <div className="aspect-video bg-zinc-900 animate-pulse rounded-[2rem]" />
  }
);

export default function WatchPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const movieId = params.id as string;

  const [movie, setMovie] = useState<any>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false); // Fix 2: Hydration Guard
  const [errorType, setErrorType] = useState<"AUTH" | "PAYMENT" | null>(null);

  // Fix 3: Set client-ready status
  useEffect(() => {
    setIsClient(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchMovieData = async () => {
      if (!movieId || !isClient) return; // Tunggu client ready

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

        if (movieData.isPremium) {
          if (!auth.currentUser) {
            setErrorType("AUTH");
            setLoading(false);
            return;
          }

          const result = await getAuthorizedMovieUrl(auth.currentUser.uid, movieId);
          if (result.url) {
            setVideoSrc(result.url);
            setErrorType(null);
          } else {
            setErrorType("PAYMENT");
          }
        } else {
          setVideoSrc(movieData.videoUrl);
          setErrorType(null);
        }
      } catch (error) {
        console.error("WatchPage Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [movieId, userId, router, isClient]);

  const handleLoginRedirect = () => {
    router.push(`/login?redirect=${pathname}`);
  };

  // Fix 4: Early return jika loading atau belum di client
  if (!isClient || loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <RiLoader4Line className="animate-spin text-white/20" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans" suppressHydrationWarning>
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

        <div className="px-4 md:px-12 pb-6">
          <div className="w-full max-w-7xl mx-auto relative group/player">
            <div className="relative w-full aspect-video md:aspect-21/9 overflow-hidden bg-zinc-900 rounded-[2rem] border border-white/5 shadow-2xl">
              {!errorType && videoSrc ? (
                <div className="h-full w-full">
                  {/* Fix 5: Key dipindah ke wrapper untuk memastikan re-mount bersih */}
                  <div key={videoSrc} className="apple-plyr-container h-full w-full">
                    <Plyr
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
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 text-center">
                  {errorType === "AUTH" ? (
                    <div className="animate-in fade-in zoom-in duration-500">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 mx-auto border border-white/10">
                        <RiUser3Line size={40} className="text-white/40" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter mb-2">Akses Terkunci</h2>
                      <p className="text-zinc-500 mb-8 max-w-sm mx-auto">Silahkan masuk untuk menonton film premium ini.</p>
                      <Button onClick={handleLoginRedirect} className="bg-white text-black hover:bg-zinc-200 px-10 h-14 rounded-2xl font-black text-lg">
                        LOGIN SEKARANG
                      </Button>
                    </div>
                  ) : (
                    <div className="animate-in fade-in zoom-in duration-500">
                      <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6 mx-auto border border-yellow-500/20">
                        <RiVipCrown2Line size={40} className="text-yellow-500" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter mb-2">Upgrade ke Pro</h2>
                      <p className="text-zinc-500 mb-8 max-w-sm mx-auto">Film ini eksklusif untuk member Pro.</p>
                      <Button onClick={() => router.push('/pricing')} className="bg-yellow-500 text-black hover:bg-yellow-400 px-10 h-14 rounded-2xl font-black text-lg shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                        BERLANGGANAN PRO
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 px-4 md:px-12 pt-10 pb-32">
        {/* Konten detail film sama seperti sebelumnya... */}
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 px-4 md:px-8">
            <div className="lg:col-span-2 space-y-8">
                 <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.9]">
                   {movie?.title}
                 </h1>
                 <p className="text-zinc-400 text-lg md:text-xl leading-relaxed">{movie?.description}</p>
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
          height: 100%;
        }
      `}</style>
    </div>
  );
}
