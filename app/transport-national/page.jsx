"use client";

import { useState } from "react";


export default function TransportNational() {

  const [menuOpen, setMenuOpen] = useState(false);


  return (

    <main className="bg-white text-gray-900 min-h-screen">


      {/* NAVIGATION */}

      <nav className="fixed top-0 w-full z-50 bg-white border-b border-gray-100 shadow-md">


        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">


          {/* Logo */}

          <div className="flex items-center gap-2">


            <img
              src="/images/IMG_0265.png"
              alt="Flashride Logistics"
              className="h-10 md:h-14 w-auto object-contain"
            />


            <div className="text-sm md:text-xl font-black whitespace-nowrap">

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





          {/* Menu desktop */}

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
              className="bg-orange-500 text-white px-5 py-3 rounded-xl font-bold hover:bg-orange-600"
            >
              Demander un devis
            </a>


          </div>





          {/* Menu mobile */}

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


      <section className="pt-32 pb-24 px-6 bg-gradient-to-br from-black via-[#0B1F3A] to-black text-white">


        <div className="max-w-6xl mx-auto">


          <p className="text-orange-400 font-bold uppercase tracking-widest">
            TRANSPORT NATIONAL & EUROPÉEN
          </p>



          <h1 className="text-4xl md:text-6xl font-black mt-5 leading-tight">

            Vos marchandises transportées en France et en Europe.

          </h1>



          <p className="mt-8 text-gray-300 text-lg md:text-xl max-w-3xl leading-relaxed">

            Flashride Logistics accompagne professionnels et particuliers
            pour leurs besoins de transport au-delà des frontières.
            De l’Île-de-France vers la France et l’Europe, nous adaptons
            nos solutions selon vos délais, vos volumes et vos contraintes.

          </p>





          <div className="mt-10 flex flex-wrap gap-4">


            <a
              href="tel:0752988155"
              className="bg-orange-500 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-orange-600"
            >
              📞 Contacter notre équipe
            </a>


            <a
              href="/#devis"
              className="border border-white/40 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-black"
            >
              Demander un devis
            </a>


          </div>


        </div>


      </section>







      {/* PRESENTATION */}


      <section className="py-20 px-6">


        <div className="max-w-6xl mx-auto">


          <h2 className="text-3xl md:text-5xl font-black text-center">

            Une solution adaptée à vos transports en France et en Europe

          </h2>



          <p className="mt-8 text-gray-600 text-lg text-center max-w-3xl mx-auto">

            Que vous soyez une entreprise ou un particulier,
            Flashride Logistics organise vos transports avec une approche
            adaptée à votre besoin, votre destination et vos contraintes.

          </p>





          <div className="grid md:grid-cols-3 gap-8 mt-14">


            {[
              {
                title:"Départs Île-de-France",
                text:"Une organisation au départ de votre zone d’activité vers vos destinations nationales et européennes."
              },
              {
                title:"Transport en France",
                text:"Des solutions adaptées pour vos livraisons ponctuelles, régulières ou vos besoins spécifiques."
              },
              {
                title:"Transport européen",
                text:"Un accompagnement pour vos transports vers les pays européens selon votre projet et vos contraintes."
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


        <div className="max-w-5xl mx-auto">


          <h2 className="text-3xl md:text-5xl font-black">

            Un transport à organiser en France ou en Europe ?

          </h2>


          <p className="mt-5 text-gray-300 text-lg">

            Notre équipe vous accompagne pour trouver une solution adaptée
            à votre destination, vos délais et votre volume.

          </p>



          <a
            href="tel:0752988155"
            className="inline-block mt-8 bg-orange-500 px-8 py-4 rounded-2xl font-bold hover:bg-orange-600 transition"
          >
            Contacter notre équipe
          </a>


        </div>


      </section>






      {/* FOOTER */}


      <footer className="bg-black text-gray-400 py-12 px-6">


        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10">



          <div>


            <h3 className="text-white text-xl font-black">


              <span className="text-[#0B1F3A]">
                FLASH
              </span>


              <span className="text-orange-500">
                RIDE
              </span>


              <span className="text-white">
                {" "}LOGISTICS
              </span>


            </h3>



            <p className="mt-4 leading-relaxed">

              Société de transport et logistique pour professionnels
              et particuliers, en France et en Europe.

            </p>


          </div>






          <div>


            <h4 className="text-white font-bold mb-4">
              Nos prestations
            </h4>


            <ul className="space-y-2">

              <li>Tournées régulières</li>

              <li>Transport express</li>

              <li>Transport dédié</li>

              <li>Transport de marchandises</li>

              <li>Logistique événementielle</li>

            </ul>


          </div>







          <div>


            <h4 className="text-white font-bold mb-4">
              Zones d’intervention
            </h4>


            <ul className="space-y-2">

              <li>Île-de-France</li>

              <li>France</li>

              <li>Europe</li>

            </ul>


          </div>







          <div>


            <h4 className="text-white font-bold mb-4">
              Contact
            </h4>



            <p>
              📞 07 52 98 81 55
            </p>


            <p className="mt-2">
              ✉ contact@flashride-logistics.com
            </p>




            <a
              href="/#devis"
              className="inline-block mt-5 bg-orange-500 text-white px-5 py-3 rounded-xl font-bold hover:bg-orange-600"
            >
              Demander un devis
            </a>


          </div>



        </div>






        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm">


          <p>
            © 2026 Flashride Logistics — Tous droits réservés.
          </p>



          <div className="mt-4 flex justify-center gap-6">


            <a
              href="/mentions-legales"
              className="hover:text-orange-500"
            >
              Mentions légales
            </a>



            <a
              href="/confidentialite"
              className="hover:text-orange-500"
            >
              Politique de confidentialité
            </a>


          </div>


        </div>



      </footer>



    </main>

  );

}