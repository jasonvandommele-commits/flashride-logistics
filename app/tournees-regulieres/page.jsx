"use client";

import { useState } from "react";


export default function TourneesRegulieres() {

  const [menuOpen, setMenuOpen] = useState(false);


  return (

    <main className="bg-white text-gray-900 min-h-screen">


      {/* NAVIGATION */}

      <nav className="fixed top-0 w-full z-50 bg-white border-b border-gray-100 shadow-md text-gray-900">


        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">


          {/* Logo + Nom */}

          <div className="flex items-center gap-2 sm:gap-3">


            <img
              src="/images/IMG_0265.png"
              alt="Flashride Logistics"
              className="h-10 md:h-14 w-auto object-contain"
            />


            <div className="text-xs sm:text-sm md:text-xl font-black tracking-wide whitespace-nowrap">

              <span className="text-[#0B1F3A]">
                FLASH
              </span>

              <span className="text-orange-500">
                RIDE
              </span>

              <span className="text-[#0B1F3A]">
                {" "}LOGISTICS
              </span>

            </div>


          </div>




          {/* Menu ordinateur */}

          <div className="hidden md:flex gap-8 items-center text-sm font-medium">


            <a href="/" className="hover:text-orange-500 transition">
              Accueil
            </a>


            <a href="/#services" className="hover:text-orange-500 transition">
              Services
            </a>


            <a href="/#about" className="hover:text-orange-500 transition">
              Entreprise
            </a>


            <a href="/#contact" className="hover:text-orange-500 transition">
              Contact
            </a>


            <a
              href="/#devis"
              className="bg-orange-500 text-white px-5 py-3 rounded-xl font-bold hover:bg-orange-600 transition"
            >
              Demander un devis
            </a>


          </div>




          {/* Mobile */}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-3xl font-bold"
          >

            {menuOpen ? "✕" : "☰"}

          </button>


        </div>





        {menuOpen && (

          <div className="md:hidden bg-white shadow-xl border-t">


            <a href="/" className="block px-6 py-4">
              Accueil
            </a>


            <a href="/#services" className="block px-6 py-4">
              Services
            </a>


            <a href="/#about" className="block px-6 py-4">
              Entreprise
            </a>


            <a href="/#contact" className="block px-6 py-4">
              Contact
            </a>


            <a
              href="/#devis"
              className="block mx-6 mb-5 bg-orange-500 text-white text-center py-3 rounded-xl font-bold"
            >
              Demander un devis
            </a>


          </div>

        )}


      </nav>





      {/* HERO */}

      <section className="relative pt-24 min-h-[650px] flex items-center bg-gradient-to-br from-black via-[#0B1F3A] to-black text-white">


        <div className="max-w-7xl mx-auto px-6 py-20">


          <p className="text-orange-400 font-bold uppercase tracking-[0.2em] mb-5">
            TOURNÉES RÉGULIÈRES
          </p>



          <h1 className="text-4xl md:text-6xl font-black leading-tight max-w-4xl">

            Des livraisons planifiées pour accompagner votre activité au quotidien.

          </h1>



          <p className="mt-8 text-gray-200 text-lg md:text-xl leading-relaxed max-w-3xl">

            Vous avez besoin d’un transport fiable chaque jour, chaque semaine
            ou selon un planning défini ? Flashride Logistics organise vos
            tournées régulières avec une solution adaptée à votre volume,
            vos contraintes horaires et vos exigences opérationnelles.

          </p>



          <div className="mt-10 flex flex-wrap gap-4">


            <a
              href="tel:0752988155"
              className="bg-orange-500 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 transition"
            >
              📞 Parler à notre équipe
            </a>


            <a
              href="/#devis"
              className="border border-white/40 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-black transition"
            >
              Demander un devis
            </a>


          </div>


        </div>


      </section>
