"use client"
import { useState, useEffect } from "react"
import {
  RiSearchLine,
  RiNotification3Line,
  RiUser3Fill,
  RiArrowDownSFill
} from "@remixicon/react"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 w-full z-50 transition-colors duration-300 px-6 py-4 flex items-center justify-between ${isScrolled ? "bg-black" : "bg-transparent bg-gradient-to-b from-black/70 to-transparent"}`}>
      <div className="flex items-center gap-10">
        <h1 className="text-red-600 text-3xl font-extrabold tracking-tighter">KINOFLIX</h1>
        <div className="hidden md:flex gap-5 text-sm font-medium text-gray-200">
          <span className="cursor-pointer hover:text-white transition">Beranda</span>
          <span className="cursor-pointer hover:text-white transition">Film</span>
          <span className="cursor-pointer hover:text-white transition">Terbaru</span>
          <span className="cursor-pointer hover:text-white transition">Daftar Saya</span>
        </div>
      </div>

      <div className="flex items-center gap-5 text-white">
        <RiSearchLine size={22} className="cursor-pointer hover:text-gray-300 transition" />

        <RiNotification3Line size={22} className="cursor-pointer hover:text-gray-300 transition" />

        <div className="flex items-center gap-1 cursor-pointer group">
          <div className="bg-zinc-800 p-1.5 rounded-md group-hover:bg-zinc-700 transition">
            <RiUser3Fill size={20} />
          </div>
          <RiArrowDownSFill size={18} className="group-hover:rotate-180 transition-transform" />
        </div>
      </div>
    </nav>
  )
}
