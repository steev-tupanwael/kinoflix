"use client"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"

// Import Remix Icon
import { RiPlayFill, RiInformationLine } from "@remixicon/react"

export default function Home() {
  return (
    <div className="relative bg-[#0a0a0a] min-h-screen pb-20">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[85vh] w-full flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10" />

        <img
          src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2000"
          className="absolute inset-0 w-full h-full object-cover"
          alt="Hero Wallpaper"
        />

        <div className="relative z-20 px-12 max-w-3xl space-y-6">
          <h1 className="text-5xl md:text-7xl font-black text-white leading-none">
            PETUALANGAN <br /> NUSANTARA
          </h1>
          <p className="text-lg text-zinc-300 max-w-xl">
            Saksikan keindahan alam dan kehangatan keluarga di pelosok Indonesia.
            Kisah yang akan membawa Anda lebih dekat dengan rumah.
          </p>
          <div className="flex gap-4">
            {/* Tombol Putar dengan RiPlayFill */}
            <Button className="bg-white text-black hover:bg-white/90 font-bold px-6 py-6">
              <RiPlayFill className="w-6 h-6 mr-2 fill-current" />
              Putar
            </Button>

            {/* Tombol Info dengan RiInformationLine */}
            <Button variant="secondary" className="bg-zinc-500/40 text-white hover:bg-zinc-500/60 backdrop-blur-md px-6 py-6">
              <RiInformationLine className="w-6 h-6 mr-2" />
              Informasi Lanjut
            </Button>
          </div>
        </div>
      </section>

      {/* Movie Rows */}
      <div className="px-12 -mt-20 relative z-30 space-y-12">
        <MovieRow title="Populer di Kinoflix" />
        <MovieRow title="Tontonan Keluarga" />
        <MovieRow title="Film Action & Petualangan" />
      </div>
    </div>
  )
}

function MovieRow({ title }: { title: string }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-zinc-200">{title}</h2>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="min-w-[180px] md:min-w-[240px] aspect-video bg-zinc-900 rounded-sm overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer border border-zinc-800 group relative"
          >
            <img
              src={`https://picsum.photos/seed/kino${i + 2}/600/400`}
              alt="Poster"
              className="w-full h-full object-cover"
            />
            {/* Overlay sederhana saat di-hover */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <RiPlayFill className="text-white w-10 h-10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
