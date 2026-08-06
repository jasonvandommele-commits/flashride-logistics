"use client";

import { useState } from "react";

export default function FlashrideLogisticsWebsite() {
  
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="bg-white text-gray-900 min-h-screen">

            {/* Navigation */}
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
      
            <a href="#" className="hover:text-orange-500 transition">
              Accueil
            </a>
      
            <a href="#services" className="hover:text-orange-500 transition">
              Services
            </a>
      
            <a href="#about" className="hover:text-orange-500 transition">
              Entreprise
            </a>
      
            <a href="#contact" className="hover:text-orange-500 transition">
              Contact
            </a>
      
            <a
              href="#devis"
              className="bg-orange-500 px-5 py-3 rounded-xl font-bold hover:bg-orange-600"
            >
              Demander un devis
            </a>
      
          </div>
      
      
                {/* Menu mobile */}
      <div className="md:hidden">
      
              <button
        onClick={() => {
          alert("test menu");
          setMenuOpen(!menuOpen);
        }}
        className="text-gray-900 text-3xl font-bold"
      >
        ☰
      </button>
      
      </div>
      
      
      {/* Menu mobile déroulant */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-xl z-[999] md:hidden">
      
          <a
            href="#"
            className="block px-6 py-4 hover:text-orange-500"
            onClick={() => setMenuOpen(false)}
          >
            Accueil
          </a>
      
          <a
            href="#services"
            className="block px-6 py-4 hover:text-orange-500"
            onClick={() => setMenuOpen(false)}
          >
            Services
          </a>
      
          <a
            href="#about"
            className="block px-6 py-4 hover:text-orange-500"
            onClick={() => setMenuOpen(false)}
          >
            Entreprise
          </a>
      
          <a
            href="#contact"
            className="block px-6 py-4 hover:text-orange-500"
            onClick={() => setMenuOpen(false)}
          >
            Contact
          </a>
      
          <a
            href="#devis"
            className="block mx-6 mb-5 bg-orange-500 text-white text-center py-3 rounded-xl font-bold"
            onClick={() => setMenuOpen(false)}
          >
            Demander un devis
          </a>
      
        </div>
      )}
      
      
        </div>
      
      </nav>


      {/* Hero */}
      <section className="pt-20 md:pt-24 bg-gradient-to-br from-black via-slate-900 to-black text-white">

       <div className="max-w-7xl mx-auto px-6 py-12 md:py-24 grid lg:grid-cols-2 gap-12 items-center">

          <div>

            <p className="text-orange-400 font-bold uppercase tracking-widest mb-5">
              TRANSPORT & LOGISTIQUE SUR MESURE
            </p>

          <h1 className="text-5xl lg:text-7xl font-black leading-tight">
              Vos solutions de
            <span className="text-orange-500">
              {" "}transport
           </span>
              {" "}à Paris, en France et en Europe.
          </h1>

            <div className="mt-8 flex flex-wrap gap-6 text-gray-300 text-sm font-medium">
          <span>✓ Paris & Île-de-France</span>
          <span>✓ France & Europe</span>
          <span>✓ Solutions sur mesure</span>
        </div>


            <div className="mt-10 flex flex-wrap gap-4">

              <a
                href="tel:0752988155"
                className="bg-orange-500 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-orange-600"
              >
                Appeler maintenant
              </a>


              <a
                href="#devis"
                className="border border-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-black"
              >
                Obtenir un devis
              </a>

            </div>

          </div>


          <div>
            <img
  src="/images/IMG_0255.jpeg"
  alt="Camion transport logistique"
  className="rounded-3xl shadow-2xl w-full h-[520px] object-cover"
/>
          </div>


        </div>

      </section>      
      {/* Services */}
      <section id="services" className="py-24 px-6 bg-gray-100">

        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-16">

            <p className="text-orange-500 font-bold uppercase tracking-widest">
              Nos services
            </p>

            <h2 className="text-5xl font-black mt-4">
              Des solutions de transport adaptées à chaque besoin
            </h2>

            <p className="mt-5 text-gray-600 text-lg">
              Flashride Logistics accompagne professionnels et particuliers avec des solutions de transport, livraison et logistique adaptées à chaque besoin.
            </p>

          </div>


          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

            {[
  {
    title: "Tournées régulières",
    text: "Des solutions de livraison récurrentes pour accompagner durablement votre activité."
  },
  {
    title: "Transport express",
    text: "Une prise en charge rapide pour vos envois urgents et vos demandes spécifiques."
  },
  {
    title: "Transport dédié",
    text: "Un véhicule et un service adaptés à vos besoins avec une organisation sur mesure."
  },
  {
    title: "Transport de marchandises",
    text: "Le transport sécurisé de vos colis, palettes et équipements professionnels."
  },
  {
    title: "Sous-traitance logistique",
    text: "Un partenaire fiable pour renforcer vos capacités de livraison au quotidien."
  },
  {
    title: "Transport national & européen",
    text: "Des solutions de transport à Paris, en France et partout en Europe."
  }
].map((service, index) => (

              <div
                  key={index}
                    className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300"
                  >

                <div className="w-14 h-14 bg-orange-500 rounded-2xl mb-6 flex items-center justify-center">
                <div className="w-5 h-5 bg-white rounded-full"></div>
              </div>

                <h3 className="text-2xl font-bold mb-3">
                  {service.title}
                </h3>

                <p className="text-gray-600 leading-relaxed">
                  {service.text}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* Pourquoi nous */}
      <section className="py-24 px-6">

        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-16">

            <p className="text-orange-500 font-bold uppercase tracking-widest">
              Notre différence
            </p>

            <h2 className="text-5xl font-black mt-4">
              Pourquoi choisir Flashride Logistics ?
            </h2>

          </div>


          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {[
              ["01", "Fiabilité", "Des prestations organisées pour garantir des livraisons sécurisées et ponctuelles."],
              ["02", "Flexibilité", "Des solutions adaptées aux professionnels comme aux particuliers."],
              ["03", "Réactivité", "Une prise en charge rapide et une organisation adaptée à vos contraintes."],
              ["04", "Couverture", "Une présence à Paris, en Île-de-France, en France et en Europe."]
            ].map((item,index)=>(

              <div
                key={index}
                className="bg-white border border-gray-200 rounded-3xl p-8 text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300"
              >

                <h3 className="text-4xl font-black text-orange-500">
                  {item[0]}
                </h3>

                <h4 className="mt-3 text-xl font-bold">
                  {item[1]}
                </h4>

                <p className="mt-3 text-gray-600 text-sm leading-relaxed">
                  {item[2]}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>      
      {/* Entreprise */}
      <section id="about" className="py-24 px-6 bg-black text-white">

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">

          <div>

            <p className="text-orange-400 font-bold uppercase tracking-widest">
              Flashride Logistics
            </p>

            <h2 className="text-5xl font-black mt-5 leading-tight">
              Un partenaire transport et logistique pour chaque mission.
            </h2>

            <p className="mt-8 text-gray-300 text-lg leading-relaxed">
              Flashride Logistics accompagne professionnels et particuliers avec des
              solutions de transport, livraison et logistique adaptées à chaque besoin.
              De la tournée régulière au transport ponctuel, nous apportons une réponse
              fiable et flexible.
            </p>

            <p className="mt-5 text-gray-300 text-lg leading-relaxed">
              Nos prestations couvrent les tournées dédiées, le transport express,
              la sous-traitance, la logistique événementielle et l’acheminement de
              marchandises en France et en Europe.
            </p>

          </div>


          <img
            src="https://images.unsplash.com/photo-1616401784845-180882ba9ba8?q=80&w=1200"
            alt="Logistique professionnelle"
            className="rounded-3xl shadow-2xl w-full h-[450px] object-cover"
          />

        </div>

      </section>



         {/* Devis */}
      <section id="devis" className="py-24 px-6 bg-gray-100">
      
        <div className="max-w-5xl mx-auto">
      
          <div className="text-center mb-12">
      
            <p className="text-orange-500 font-bold uppercase tracking-widest">
              Demande de transport
            </p>
      
            <h2 className="text-5xl font-black mt-4">
              Obtenez votre solution de transport
            </h2>
      
            <p className="mt-5 text-gray-600 text-lg">
              Décrivez votre besoin. Notre équipe vous propose une solution adaptée
              à votre activité, vos délais et votre volume de marchandises.
            </p>
      
          </div>
      
      
          <form className="bg-white rounded-3xl shadow-xl p-8 grid md:grid-cols-2 gap-6">
      
      
            <select className="border rounded-xl p-4 md:col-span-2">
              <option>Type de prestation</option>
              <option>Tournée dédiée</option>
              <option>Transport express</option>
              <option>Transport de marchandises</option>
              <option>Sous-traitance transport</option>
              <option>Logistique événementielle</option>
              <option>Transport national & européen</option>
            </select>
      
      
            <select className="border rounded-xl p-4">
              <option>Vous êtes</option>
              <option>Entreprise</option>
              <option>Particulier</option>
            </select>
      
      
            <select className="border rounded-xl p-4">
              <option>Type de véhicule souhaité</option>
              <option>2 roues</option>
              <option>Véhicule léger jusqu'à 6m³</option>
              <option>Utilitaire jusqu'à 12m³</option>
              <option>Utilitaire 20m³ avec hayon</option>
              <option>Besoin à définir</option>
            </select>
      
      
            <input
              className="border rounded-xl p-4"
              placeholder="Nom / Entreprise"
            />
      
      
            <input
              className="border rounded-xl p-4"
              placeholder="Téléphone"
            />
      
      
            <input
              className="border rounded-xl p-4"
              placeholder="Email"
            />
      
      
            <input
              type="date"
              className="border rounded-xl p-4"
            />
      
      
            <input
              className="border rounded-xl p-4"
              placeholder="Volume (colis, palettes, dimensions)"
            />
      
      
            <input
              className="border rounded-xl p-4"
              placeholder="Ville de départ"
            />
      
      
            <input
              className="border rounded-xl p-4"
              placeholder="Ville d'arrivée"
            />
      
      
            <input
              className="border rounded-xl p-4 md:col-span-2"
              placeholder="Type de marchandise"
            />
      
      
            <textarea
              className="border rounded-xl p-4 md:col-span-2"
              placeholder="Décrivez votre besoin (horaires, contraintes, informations complémentaires...)"
              rows="5"
            />
      
      
            <button
              className="bg-orange-500 text-white font-bold text-lg rounded-xl p-4 md:col-span-2 hover:bg-orange-600 transition"
            >
              Recevoir ma proposition
            </button>
      
      
          </form>
      
        </div>
      
      </section>



      {/* Contact */}
      
      <section id="contact" className="py-20 px-6 bg-white">
         <div className="max-w-6xl mx-auto text-center">
    
      <p className="text-orange-500 font-bold uppercase tracking-widest">
        Contact
      </p>
    
      <h2 className="text-5xl font-black mt-4">
        Parlons de votre projet transport
      </h2>
    
      <p className="mt-5 text-gray-600 text-lg">
        Une question, une demande spécifique ou un besoin régulier ?
        Notre équipe est à votre écoute pour trouver la solution adaptée.
      </p>
    
    
      <div className="mt-12 grid md:grid-cols-3 gap-6">
    
    
        <div className="bg-gray-100 rounded-3xl p-8">
          <p className="text-orange-500 font-bold">
            Téléphone
          </p>
    
          <a
          href="tel:0752988155"
          className="mt-3 font-semibold block hover:text-orange-500"
        >
          07 52 98 81 55
        </a>
        </div>
    
    
        <div className="bg-gray-100 rounded-3xl p-8">
          <p className="text-orange-500 font-bold">
            Email
          </p>
    
          <a
          href="mailto:contact@flashride-logistics.com"
          className="mt-3 font-semibold block hover:text-orange-500"
        >
          contact@flashride-logistics.com
        </a>
        </div>
    
    
        <div className="bg-gray-100 rounded-3xl p-8">
          <p className="text-orange-500 font-bold">
            Zone d’intervention
          </p>
    
          <p className="mt-3 font-semibold">
            Paris • Île-de-France • France • Europe
          </p>
        </div>
    
    
      </div>
    
    
      <div className="mt-10">
    
        <a
          href="#devis"
          className="inline-block bg-orange-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-orange-600 transition"
        >
          Demander une étude personnalisée
        </a>
    
      </div>
    
    
    </div>

      </section>



          {/* Footer */}
    <footer className="bg-black text-gray-400 py-12 px-6">
    
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10">
    
    
        <div>
    
          <h3 className="text-white text-xl font-black">
            <span className="text-[#0B1F3A]">FLASH</span>
            <span className="text-orange-500">RIDE</span>
            <span className="text-white"> LOGISTICS</span>
          </h3>
    
          <p className="mt-4 leading-relaxed">
            Société de transport et logistique pour professionnels et particuliers.
            Des solutions adaptées aux tournées, livraisons, événements et besoins
            spécifiques.
          </p>
    
        </div>
    
    
        <div>
    
          <h4 className="text-white font-bold mb-4">
            Nos prestations
          </h4>
    
          <ul className="space-y-2">
            <li>Tournées dédiées</li>
            <li>Transport express</li>
            <li>Transport de marchandises</li>
            <li>Sous-traitance transport</li>
            <li>Logistique événementielle</li>
            <li>Transport national & européen</li>
          </ul>
    
        </div>
    
    
        <div>
    
          <h4 className="text-white font-bold mb-4">
            Zones d’intervention
          </h4>
    
          <ul className="space-y-2">
            <li>Paris</li>
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
            href="#devis"
            className="inline-block mt-5 bg-orange-500 text-white px-5 py-3 rounded-xl font-bold hover:bg-orange-600 transition"
          >
            Demander un devis
          </a>
    
        </div>
    
    
      </div>
    
    
      <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm">
    
        © 2026 Flashride Logistics — Tous droits réservés.
    
      </div>
    
    
    </footer>

    </main>
  );
}