"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase/firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  limit,
  query
} from "firebase/firestore";
import { Movie } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { RiLock2Line, RiPlayFill, RiStarFill } from "@remixicon/react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Tunggu hingga auth selesai dicheck
      if (authLoading) return;

      try {
        // 1. Ambil Data User jika sedang login
        if (user) {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserData(userSnap.data());
          }
        }

        // 2. Ambil Katalog Film
        const q = query(collection(db, "movies"), limit(15));
        const movieSnap = await getDocs(q);
        const movieList = movieSnap.docs.map(doc => ({
          ...doc.data(),
          movieId: doc.id
        })) as Movie[];

        setMovies(movieList);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoadingData(false);
      }
    }

    fetchData();
  }, [user, authLoading]);

  if (authLoading || loadingData) return <HomeSkeleton />;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      {/* Navbar Minimalis */}
      <nav className="flex justify-between items-center p-6 md:px-12 bg-gradient-to-b from-black/80 to-transparent fixed w-full z-50">
        <div className="flex items-center gap-2">
          <i className="ri-movie-2-fill text-3xl text-red-600"></i>
          <span className="text-2xl font-black tracking-tighter uppercase">Kinoflix</span>
        </div>

        <div className="flex items-center gap-4">
          {userData?.isPremium ? (
            <Badge className="bg-yellow-500 text-black border-none hover:bg-yellow-600 font-bold px-3 py-1">
              <i className="ri-vip-crown-fill mr-1"></i> PRO
            </Badge>
          ) : (
            <Button variant="ghost" className="text-white hover:text-yellow-500 hidden md:flex items-center gap-2">
              <i className="ri-flashlight-line"></i> Upgrade
            </Button>
          )}
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
            <i className="ri-user-3-line text-xl"></i>
          </div>
        </div>
      </nav>

      {/* Hero Section (Simple) */}
      <section className="relative h-[60vh] flex items-center px-6 md:px-12 pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-black via-black/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070')] bg-cover bg-center opacity-40" />

        <div className="relative z-20 max-w-2xl">
          <Badge className="mb-4 bg-red-600/20 text-red-500 border-red-600/50">New Release</Badge>
          <h2 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">Mulai Petualangan Sinematik</h2>
          <p className="text-gray-400 text-lg mb-8 line-clamp-2">
            Nikmati ribuan koleksi film eksklusif dan serial original terbaik hanya di Kinoflix.
            Kualitas 4K HDR tanpa gangguan iklan.
          </p>
          <div className="flex gap-4">
            <Button size="lg" className="bg-white text-black hover:bg-gray-200 px-8 font-bold">
              <i className="ri-play-fill mr-2 text-xl"></i> Tonton Sekarang
            </Button>
            <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/10 px-8">
              <i className="ri-information-line mr-2 text-xl"></i> Info Detail
            </Button>
          </div>
        </div>
      </section>

      {/* Movie Grid */}
      <section className="px-6 md:px-12 py-12">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-semibold flex items-center gap-2">
            <i className="ri-fire-line text-orange-500"></i> Sedang Populer
          </h3>
          <button className="text-sm text-zinc-400 hover:text-white transition">Lihat Semua <i className="ri-arrow-right-s-line"></i></button>
        </div>

        {/* Ganti grid di section Movie Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {movies.map((movie) => (
            <MovieCard
              key={movie.movieId}
              movie={movie}
              isUserPremium={userData?.isPremium}
            />
          ))}
        </div>

      </section>
    </div>
  );
}

// Sub-Component: Movie Card menggunakan Shadcn UI
function MovieCard({ movie, isUserPremium }: { movie: Movie, isUserPremium: boolean }) {
  const router = useRouter();
  const isLocked = movie.isLocked && !isUserPremium;

  const handleNavigation = () => {
    if (isLocked) {
      // Kamu bisa arahkan ke halaman langganan atau tampilkan toast
      alert("Konten ini khusus member Premium");
      return;
    }
    // Navigasi ke halaman nonton
    router.push(`/watch/${movie.movieId}`);
  };

  return (
    <div
      onClick={handleNavigation}
      className="group cursor-pointer"
    >
      {/* Container Gambar dengan Aspect Ratio 16:9 */}
      <div className="relative aspect-video overflow-hidden rounded-xl bg-zinc-900 shadow-2xl transition-all duration-500 group-hover:scale-[1.02] group-hover:ring-2 ring-white/20">
        <img
          src={movie.thumbnailUrl}
          alt={movie.title}
          className="object-cover w-full h-full transition duration-700 group-hover:opacity-80"
        />

        {/* Overlay saat Hover - Lebih Halus */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
          {isLocked ? (
            <RiLock2Line className="size-8 text-white/70" />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-md shadow-2xl">
              {/* Gunakan translate-x atau ml untuk menggeser beban visual segitiga ke kanan.
         Hanya berikan ini pada icon Play, jangan pada icon Lock.
      */}
              <RiPlayFill className="size-8 text-white" />
            </div>
          )}
        </div>

        {/* Badge di atas gambar */}
        <div className="absolute top-3 left-3 flex gap-2">
          {movie.category === "Series" && (
            <Badge className="bg-white/10 backdrop-blur-md text-[10px] font-bold tracking-wider text-white border-none px-2 py-0.5">
              SERIES
            </Badge>
          )}
          {isLocked && (
            <Badge className="bg-yellow-500 text-black text-[10px] font-bold border-none px-2 py-0.5">
              PREMIUM
            </Badge>
          )}
        </div>
      </div>

      {/* Info Film */}
      <div className="mt-4 px-1">
        <h4 className="text-lg font-medium text-zinc-100 group-hover:text-white transition-colors line-clamp-1 leading-tight">
          {movie.title}
        </h4>
        <div className="flex items-center gap-2 mt-1 text-sm text-zinc-500">
          <span>{movie.genre[0]}</span>
          <span className="w-1 h-1 rounded-full bg-zinc-700" />
          <div className="flex items-center gap-1">
            <RiStarFill className="text-yellow-500" />
            <span className="text-zinc-300">4.8</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-Component: Loading State
function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] p-12">
      <div className="flex gap-4 items-center mb-12">
        <Skeleton className="h-10 w-40 bg-zinc-900" />
        <div className="ml-auto flex gap-2">
          <Skeleton className="h-10 w-10 rounded-full bg-zinc-900" />
          <Skeleton className="h-10 w-10 rounded-full bg-zinc-900" />
        </div>
      </div>
      <Skeleton className="h-[40vh] w-full mb-12 bg-zinc-900 rounded-xl" />
      <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton className="aspect-[2/3] w-full bg-zinc-900 rounded-lg" />
            <Skeleton className="h-4 w-3/4 bg-zinc-900" />
          </div>
        ))}
      </div>
    </div>
  );
}
