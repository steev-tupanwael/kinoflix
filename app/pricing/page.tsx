"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { 
  RiCheckLine, 
  RiVipCrown2Fill, 
  RiStarSLine,
  RiArrowLeftLine,
  RiNetflixFill,
  RiFlashlightFill
} from "@remixicon/react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Gratis",
    price: "Rp 0",
    description: "Untuk kamu yang baru mau coba-coba.",
    features: ["Akses film gratis", "Kualitas SD (480p)", "Ada iklan"],
    buttonText: "Mulai Gratis",
    premium: false,
  },
  {
    name: "Kinoflix Pro",
    price: "Rp 49.000",
    period: "/bulan",
    description: "Akses penuh tanpa batas untuk pecinta film sejati.",
    features: [
      "Semua akses film Premium",
      "Kualitas 4K HDR",
      "Tanpa Iklan",
      "Nonton di 2 perangkat sekaligus",
      "Dukungan prioritas"
    ],
    buttonText: "Beli Pro Sekarang",
    premium: true,
  },
];

export default function PricingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-yellow-500/30">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-yellow-500/10 to-transparent blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 p-6 md:p-12">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="text-white/60 hover:text-white hover:bg-white/10 gap-2 rounded-full"
        >
          <RiArrowLeftLine size={20} />
          Kembali
        </Button>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pb-24 text-center">
        {/* Title Section */}
        <div className="space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-4 py-1.5 rounded-full">
            <RiVipCrown2Fill className="text-yellow-500" size={16} />
            <span className="text-[10px] font-black tracking-[0.2em] text-yellow-500 uppercase">Kinoflix Premium</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.9]">
            PILIH PAKET <br /> <span className="text-zinc-600 text-outline">HIBURANMU</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto font-medium">
            Mulai dari gratis hingga pengalaman bioskop 4K di rumahmu. Batalkan kapan saja.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative group p-8 rounded-[2.5rem] border transition-all duration-500 ${
                plan.premium 
                ? "bg-zinc-900/50 border-yellow-500/30 hover:border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.05)]" 
                : "bg-zinc-900/30 border-white/5 hover:border-white/10"
              }`}
            >
              {plan.premium && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest">
                  Paling Populer
                </div>
              )}

              <div className="text-left space-y-6">
                <div>
                  <h3 className={`text-2xl font-black uppercase italic ${plan.premium ? 'text-yellow-500' : 'text-white'}`}>
                    {plan.name}
                  </h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-black tracking-tighter">{plan.price}</span>
                    <span className="text-zinc-500 font-bold">{plan.period}</span>
                  </div>
                  <p className="mt-3 text-zinc-500 text-sm leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <div className="h-[1px] w-full bg-white/5" />

                <ul className="space-y-4">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-3 text-zinc-300 text-sm font-medium">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${plan.premium ? 'bg-yellow-500/20 text-yellow-500' : 'bg-white/10 text-white/40'}`}>
                        <RiCheckLine size={14} />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full h-14 rounded-2xl font-black text-lg transition-all active:scale-95 ${
                    plan.premium 
                    ? "bg-yellow-500 text-black hover:bg-yellow-400 shadow-lg shadow-yellow-500/20" 
                    : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                  }`}
                  onClick={() => plan.premium ? console.log("Lanjut ke Midtrans") : router.push("/")}
                >
                  {plan.buttonText}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Preview */}
        <p className="mt-16 text-zinc-600 text-sm font-medium">
          Ada pertanyaan? <span className="text-white cursor-pointer hover:underline">Hubungi kami</span> • Syarat & Ketentuan berlaku.
        </p>
      </main>

      <style jsx>{`
        .text-outline {
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.1);
          color: transparent;
        }
      `}</style>
    </div>
  );
}
