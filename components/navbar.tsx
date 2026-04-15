"use client"
import { useState, useEffect } from "react"
import {
  RiSearchLine,
  RiNotification3Line,
  RiUser3Fill,
  RiMenuLine,
  RiCloseLine
} from "@remixicon/react"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 px-4 md:px-12 py-4 flex items-center justify-between ${isScrolled || isMobileMenuOpen ? "bg-black" : "bg-transparent bg-linear-to-b from-black/80 to-transparent"
      }`}>
      <div className="flex items-center gap-4 md:gap-10">
        {/* Hamburger Menu untuk Mobile */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <RiCloseLine size={28} /> : <RiMenuLine size={28} />}
        </button>

        <h1 className="text-red-600 text-2xl md:text-3xl font-extrabold tracking-tighter">KINOFLIX</h1>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-5 text-sm font-medium text-gray-200">
          <span className="cursor-pointer hover:text-white transition">Beranda</span>
          <span className="cursor-pointer hover:text-white transition">Film</span>
          <span className="cursor-pointer hover:text-white transition">Daftar Saya</span>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6 text-white">
        <RiSearchLine className="w-5 h-5 cursor-pointer" />
        <RiNotification3Line className="w-5 h-5 hidden md:block" />
        <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center">
          <RiUser3Fill className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-black/95 backdrop-blur-lg flex flex-col p-6 gap-6 text-white md:hidden border-b border-zinc-800 animate-in slide-in-from-top duration-300">
          <span className="text-lg font-semibold">Beranda</span>
          <span className="text-lg font-semibold">Film</span>
          <span className="text-lg font-semibold">Terbaru</span>
          <span className="text-lg font-semibold">Daftar Saya</span>
        </div>
      )}
    </nav>
  )
}
