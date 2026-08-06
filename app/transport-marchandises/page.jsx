"use client";

import { useState } from "react";

export default function TransportMarchandises() {

  const [menuOpen, setMenuOpen] = useState(false);


  return (

    <main className="bg-white text-gray-900 min-h-screen">


      {/* HEADER */}

      <nav className="fixed top-0 w-full z-50 bg-white border-b border-gray-100 shadow-md">


        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">


          <div className="flex items-center gap-2">

            <img
              src="/images/IMG_0265.png"
              alt="Flashride Logistics"
              className="h-10 md:h-14 w-auto"
            />


            <div className="text-sm md:text-xl font-black whitespace-nowrap">

              <span className="text-[#0B1F3A]">FLASH</span>
              <span className="text-orange-500">RIDE</span>
              <span className="text-[#0B1F3A]"> LOGISTICS</span>

            </div>

          </div>



          <div className="hidden md:flex gap-8 items-center text-sm font-medium">

            <a href="/" className="hover:text-orange-500">
              Accueil
            </a>

            <a href="/#services" className="hover:text-orange-500">
              Services
            </a>

            <a href="/#about" className="hover:text-orange-500">
              Entreprise
            </a>

            <a href="/#contact" className="hover:text-orange-500">
              Contact
            </a>

            <a
              href="/#devis"
              className="bg-orange-500 text-white px-5 py-3 rounded-xl font-bold"
            >
              Demander un devis
            </a>

          </div>



          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-3xl"
          >
            {menuOpen ? "✕" : "☰"}
          </button>


        </div>



        {menuOpen && (

          <div className="md:hidden bg-white shadow-xl">

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

      <section className="pt-32 pb-24 px-6 bg-gradient-to-br from-black via-[#0B1F3A] to-black text-white">


        <div className="max-w-6xl mx-auto">


          <p className="text-orange-400 font-bold uppercase tracking-widest">
            TRANSPORT DE MARCHANDISES
          </p>


          <h1 className="text-4xl md:text-6xl font-black mt-5 leading-tight">

            Transporter vos marchandises en toute simplicité.

          </h1>


          <p className="mt-8 text-gray-300 text-lg max-w-3xl leading-relaxed">

            Qu’il s’agisse de marchandises professionnelles,
            d’équipements, de meubles ou d’objets volumineux,
            Flashride Logistics assure leur transport avec une
            organisation adaptée à votre situation.

          </p>



          <div className="mt-10 flex flex-wrap gap-4">


            <a
              href="tel:0752988155"
              className="bg-orange-500 px-8 py-4 rounded-2xl font-bold"
            >
              📞 Contacter notre équipe
            </a>


            <a
              href="/#devis"
              className="border border-white/40 px-8 py-4 rounded-2xl font-bold"
            >
              Demander un devis
            </a>


          </div>


        </div>


      </section>





      {/* CONTENU */}

      <section className="py-20 px-6">


        <div className="max-w-6xl mx-auto">


          <h2 className="text-3xl md:text-5xl font-black text-center">

            Une solution adaptée à chaque besoin

          </h2>


          <p className="mt-8 text-gray-600 text-lg text-center max-w-3xl mx-auto">

            Flashride Logistics accompagne aussi bien les professionnels
            que les particuliers pour le transport de marchandises,
            avec une prestation adaptée aux contraintes de chaque mission.

          </p>




          <div className="grid md:grid-cols-3 gap-8 mt-14">


            {[
              {
                title:"Professionnels",
                text:"Transport de marchandises, équipements et besoins réguliers pour accompagner votre activité."
              },
              {
                title:"Particuliers",
                text:"Transport de meubles, objets volumineux ou biens nécessitant un véhicule adapté."
              },
              {
                title:"Besoins spécifiques",
                text:"Une organisation personnalisée selon le volume, les délais et les contraintes."
              }
            ].map((item,index)=>(


              <div
                key={index}
                className="bg-gray-100 rounded-3xl p-8"
              >

                <h3 className="text-2xl font-bold">
                  {item.title}
                </h3>


                <p className="mt-4 text-gray-600 leading-relaxed">
                  {item.text}
                </p>


              </div>


            ))}


          </div>


        </div>


      </section>





      {/* CTA */}

      <section className="py-20 px-6 bg-[#0B1F3A] text-white text-center">


        <h2 className="text-3xl md:text-5xl font-black">

          Besoin de transporter une marchandise ?

        </h2>


        <p className="mt-5 text-gray-300 text-lg">
          Notre équipe vous accompagne pour trouver la solution adaptée.
        </p>


        <a
          href="tel:0752988155"
          className="inline-block mt-8 bg-orange-500 px-8 py-4 rounded-2xl font-bold"
        >
          Contacter notre équipe
        </a>


      </section>





      {/* FOOTER */}

      <footer className="bg-black text-gray-400 py-12 px-6">


        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10">


          <div>

            <h3 className="text-white text-xl font-black">
              <span className="text-[#0B1F3A]">FLASH</span>
              <span className="text-orange-500">RIDE</span>
              <span className="text-white"> LOGISTICS</span>
            </h3>


            <p className="mt-4">
              Société de transport et logistique pour professionnels et particuliers.
            </p>

          </div>



          <div>

            <h4 className="text-white font-bold mb-4">
              Prestations
            </h4>

            <p>Tournées régulières</p>
            <p>Transport express</p>
            <p>Transport dédié</p>
            <p>Transport marchandises</p>

          </div>



          <div>

            <h4 className="text-white font-bold mb-4">
              Zones
            </h4>

            <p>Paris</p>
            <p>Île-de-France</p>
            <p>France</p>

          </div>



          <div>

            <h4 className="text-white font-bold mb-4">
              Contact
            </h4>

            <p>📞 07 52 98 81 55</p>

            <p className="mt-2">
              ✉ contact@flashride-logistics.com
            </p>

          </div>


        </div>



        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm">

          © 2026 Flashride Logistics — Tous droits réservés.

        </div>


      </footer>


    </main>

  );

}
