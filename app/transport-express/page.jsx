"use client";

import { useState } from "react";

export default function TransportExpress() {

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="bg-white text-gray-900 min-h-screen">

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

          <span className="text-[#0B1F3A]">FLASH</span>
          <span className="text-orange-500">RIDE</span>
          <span className="text-[#0B1F3A]"> LOGISTICS</span>

        </div>

      </div>


      {/* Menu PC */}
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
          className="bg-orange-500 text-white px-5 py-3 rounded-xl font-bold hover:bg-orange-600"
        >
          Demander un devis
        </a>

      </div>


      {/* Menu mobile */}
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

      {/* BANNIÈRE HERO */}

<section
  className="relative pt-24 min-h-[650px] flex items-center bg-cover bg-center"
  style={{
    backgroundImage:
      "url('/images/IMG_0255.jpeg')",
  }}
>

  <div className="absolute inset-0 bg-[#0B1F3A]/85"></div>


  <div className="relative max-w-7xl mx-auto px-6 py-20 text-white">


    <p className="text-orange-400 font-bold uppercase tracking-[0.2em] mb-5">
      TRANSPORT EXPRESS
    </p>


    <h1 className="text-4xl md:text-6xl font-black leading-tight max-w-4xl">

      Transport express :
      <span className="text-orange-500">
        {" "}quand chaque minute compte.
      </span>

    </h1>



    <p className="mt-8 text-gray-200 text-lg md:text-xl leading-relaxed max-w-3xl">

      Un imprévu peut arriver à tout moment : une pièce urgente,
      une marchandise à déplacer rapidement ou une livraison qui
      ne peut pas attendre. Flashride Logistics met en place une
      solution express pour vous permettre de respecter vos engagements.

    </p>



    <div className="mt-10 flex flex-wrap gap-4">


      <a
        href="tel:0752988155"
        className="bg-orange-500 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 transition"
      >
        📞 Appeler pour une urgence
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

      {/* BESOIN */}

      <section className="py-20 px-6 bg-gray-100">


        <div className="max-w-6xl mx-auto">


          <div className="text-center mb-12">


            <p className="text-orange-500 font-bold uppercase tracking-widest">
              Transport express
            </p>


            <h2 className="text-3xl md:text-5xl font-black mt-4">
              Dans quels cas faire appel à nous ?
            </h2>


          </div>



          <div className="grid md:grid-cols-2 gap-6">


            {[
              "Une pièce urgente doit arriver rapidement",
              "Votre activité est bloquée par un imprévu",
              "Votre client attend une livraison prioritaire",
              "Vous avez besoin d’un transport ponctuel"
            ].map((item,index)=>(


              <div
                key={index}
                className="bg-white rounded-3xl p-8 shadow-sm"
              >

                <p className="text-lg font-bold">
                  ✓ {item}
                </p>


              </div>


            ))}


          </div>


        </div>


      </section>




      {/* EXPLICATION */}

      <section className="py-20 px-6 bg-white">


        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">


          <div>


            <p className="text-orange-500 font-bold uppercase tracking-widest">
              Notre mission
            </p>


            <h2 className="text-3xl md:text-5xl font-black mt-4">
              Un transport rapide, organisé et sécurisé.
            </h2>


            <p className="mt-6 text-gray-600 text-lg leading-relaxed">

              Le transport express permet d’acheminer une marchandise
              avec un délai réduit lorsque le transport classique n’est
              pas suffisant.

            </p>


            <p className="mt-5 text-gray-600 text-lg leading-relaxed">

              Nous adaptons la solution selon votre volume,
              votre destination et votre contrainte de délai.

            </p>


          </div>



          <div className="bg-[#0B1F3A] text-white rounded-3xl p-10">


            <h3 className="text-2xl font-bold">
              Nos engagements
            </h3>


            <ul className="mt-6 space-y-4 text-gray-200">

              <li>✓ Réactivité</li>
              <li>✓ Ponctualité</li>
              <li>✓ Transport sécurisé</li>
              <li>✓ Suivi personnalisé</li>

            </ul>


          </div>


        </div>


      </section>




      {/* FONCTIONNEMENT */}

      <section className="py-20 px-6 bg-gray-100">


        <div className="max-w-6xl mx-auto">


          <h2 className="text-center text-3xl md:text-5xl font-black mb-12">
            Comment ça fonctionne ?
          </h2>



          <div className="grid md:grid-cols-3 gap-8">


            {[
              ["01","Contact","Vous nous expliquez votre besoin urgent."],
              ["02","Organisation","Nous trouvons la solution adaptée."],
              ["03","Livraison","Votre marchandise est acheminée."]
            ].map((step,index)=>(


              <div
                key={index}
                className="bg-white rounded-3xl p-8 text-center"
              >

                <p className="text-orange-500 text-4xl font-black">
                  {step[0]}
                </p>

                <h3 className="text-xl font-bold mt-4">
                  {step[1]}
                </h3>

                <p className="text-gray-600 mt-3">
                  {step[2]}
                </p>


              </div>


            ))}


          </div>


        </div>


      </section>




      {/* CTA */}

      <section className="py-20 px-6 bg-[#0B1F3A] text-white text-center">


        <h2 className="text-3xl md:text-5xl font-black">
  Besoin d’une solution de transport rapidement ?
</h2>


<p className="mt-5 text-gray-300 text-lg">
  Notre équipe est à votre écoute pour comprendre votre besoin
  et vous proposer une solution adaptée à votre situation.
</p>


<a
  href="tel:0752988155"
  className="inline-block mt-8 bg-orange-500 px-8 py-4 rounded-2xl font-bold text-lg"
>
  📞 Contacter notre équipe
</a>


      </section>




      {/* FOOTER */}

      <footer className="bg-black text-gray-400 py-10 px-6">


        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">


          <div>

            <h3 className="text-white text-xl font-black">
              <span className="text-white">FLASH</span>
              <span className="text-orange-500">RIDE</span>
              <span className="text-white"> LOGISTICS</span>
            </h3>


            <p className="mt-4">
              Transport express et solutions logistiques pour professionnels
              et particuliers.
            </p>

          </div>



          <div>

            <h4 className="text-white font-bold">
              Contact
            </h4>

            <p className="mt-4">
              📞 07 52 98 81 55
            </p>

            <p>
              ✉ contact@flashride-logistics.com
            </p>

          </div>



          <div>

            <h4 className="text-white font-bold">
              Informations
            </h4>

            <p className="mt-4">
              Paris • Île-de-France • France
            </p>

          </div>


        </div>


      </footer>


    </main>
  );
}