"use client";

import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white border-b border-gray-100 shadow-md text-gray-900">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">

        {/* Logo + Nom */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
          <img
            src="/images/IMG_0265.png"
            alt="Flashride Logistics"
            className="h-10 md:h-14 w-auto object-contain"
          />

          <div className="text-xs sm:text-sm md:text-xl font-black tracking-wide whitespace-nowrap">
            <span className="text-[#0B1F3A]">FLASH</span>
            <span className="text-orange-500">RIDE</span>
            <span className="text-[#0B1F3A]"> LOGISTICS</span>
          </div>
        </div>

        {/* Menu PC */}
        <div className="hidden md:flex gap-8 items-center text-sm font-medium">

          <a
            href="/"
            className="hover:text-orange-500 transition"
          >
            Accueil
          </a>

          <a
            href="/#services"
            className="hover:text-orange-500 transition"
          >
            Services
          </a>

          <a
            href="/#about"
            className="hover:text-orange-500 transition"
          >
            Entreprise
          </a>

          <a
            href="/#contact"
            className="hover:text-orange-500 transition"
          >
            Contact
          </a>

          <a
            href="/devis"
            className="bg-orange-500 text-white px-5 py-3 rounded-xl font-bold hover:bg-orange-600 transition"
          >
            Demander un devis
          </a>

        </div>

        {/* Menu mobile - bouton */}
        <div className="md:hidden">

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-900 text-3xl font-bold"
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {menuOpen ? "✕" : "☰"}
          </button>

        </div>

        {/* Menu mobile déroulant */}
        {menuOpen && (
          <div className="absolute top-full left-0 w-full bg-white shadow-xl z-[999] md:hidden">

            <a
              href="/"
              className="block px-6 py-4 hover:text-orange-500 transition"
              onClick={() => setMenuOpen(false)}
            >
              Accueil
            </a>

            <a
              href="/#services"
              className="block px-6 py-4 hover:text-orange-500 transition"
              onClick={() => setMenuOpen(false)}
            >
              Services
            </a>

            <a
              href="/#about"
              className="block px-6 py-4 hover:text-orange-500 transition"
              onClick={() => setMenuOpen(false)}
            >
              Entreprise
            </a>

            <a
              href="/#contact"
              className="block px-6 py-4 hover:text-orange-500 transition"
              onClick={() => setMenuOpen(false)}
            >
              Contact
            </a>

            <a
              href="/devis"
              className="block mx-6 mb-5 bg-orange-500 text-white text-center py-3 rounded-xl font-bold hover:bg-orange-600 transition"
              onClick={() => setMenuOpen(false)}
            >
              Demander un devis
            </a>

          </div>
        )}

      </div>
    </nav>
  );
}