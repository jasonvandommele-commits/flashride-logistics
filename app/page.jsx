"use client";

import { useState } from "react";

export default function FlashrideLogisticsWebsite() {

  const [menuOpen, setMenuOpen] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    const response = await fetch("/api/devis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      setSent(true);
      e.target.reset();
    } else {
      alert("Erreur lors de l’envoi.");
    }
  };

  return (
    <main className="bg-white text-gray-900 min-h-screen">
      
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
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-900 text-3xl font-bold"
          >
            {menuOpen ? "✕" : "☰"}
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


                  {/* HERO */}
      
      <section className="pt-24 bg-gradient-to-br from-black via-[#0B1F3A] to-black text-white">
      
      
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
      
      
      
          {/* TEXTE */}
      
          <div>
      
      
      
            <p className="text-orange-400 font-bold uppercase tracking-[0.2em] mb-5">
      
              TRANSPORT & LOGISTIQUE SUR MESURE
      
            </p>
      
      
      
      
      
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight">
      
      
              Votre transport,
              <span className="text-orange-500">
                {" "}simplement organisé.
              </span>
      
      
            </h1>
      
      
      
      
      
            <p className="mt-7 text-gray-300 text-lg md:text-xl leading-relaxed max-w-xl">
      
      
              Flashride Logistics accompagne entreprises et particuliers
              pour leurs besoins de transport : livraisons, tournées régulières,
              transport de marchandises et missions spécifiques en France et en Europe.
      
      
            </p>
      
      
      
      
      
            <div className="mt-8 flex flex-wrap gap-4 text-sm text-gray-300">
      
      
              <span>
                ✓ Transport express
              </span>
      
      
              <span>
                ✓ Tournées régulières
              </span>
      
      
              <span>
                ✓ Transport dédié
              </span>
      
      
              <span>
                ✓ France & Europe
              </span>
      
      
            </div>
      
      
            <div className="mt-8 flex flex-wrap gap-3">


            <a
              href="tel:0752988155"
              className="bg-orange-500 w-52 h-12 rounded-xl font-semibold text-base hover:bg-orange-600 transition flex items-center justify-center gap-2"
            >
              <span className="text-lg leading-none">
                📞
              </span>
          
              <span className="leading-none">
                Appeler notre équipe
              </span>
          
            </a>
          
          
          
          
            <a
              href="#devis"
              className="border border-white/40 w-52 h-12 rounded-xl font-semibold text-base hover:bg-white hover:text-black transition flex items-center justify-center"
            >
          
              <span className="leading-none">
                Demander un devis
              </span>
          
            </a>
          
          
          </div>
      
      
            <div className="mt-10 flex gap-10 text-sm text-gray-400">
      
      
              <div>
      
                <p className="text-white font-bold text-xl">
                  IDF
                </p>
      
                Départ & organisation nationale
      
              </div>
      
      
      
      
      
              <div>
      
                <p className="text-white font-bold text-xl">
                  Pro & Particuliers
                </p>
      
                Solutions adaptées
      
              </div>
      
      
            </div>
      
      
      
          </div>
      
      
      
      
      
      
      
      
          {/* IMAGE */}
      
          <div className="relative">
      
      
            <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full"></div>
      
      
      
      
            <img
              src="/images/hero-acceuil.jpg"
              alt="Flashride Logistics transport"
              className="relative rounded-3xl shadow-2xl w-full h-[420px] md:h-[520px] object-cover"
            />
      
      
      
          </div>
      
      
      
      
        </div>
      
      
      </section>
            {/* SERVICES */}

      <section id="services" className="py-24 px-6 bg-gray-100">
      
      
        <div className="max-w-7xl mx-auto">
      
      
          <div className="text-center mb-16">
      
      
            <p className="text-orange-500 font-bold uppercase tracking-widest">
              Nos services
            </p>
      
      
            <h2 className="text-3xl md:text-5xl font-black mt-4">
              Des solutions de transport adaptées à chaque besoin
            </h2>
      
      
            <p className="mt-5 text-gray-600 text-lg max-w-4xl mx-auto">
      
              Flashride Logistics accompagne entreprises et particuliers
              avec des solutions de transport flexibles, du besoin ponctuel
              aux prestations régulières.
      
            </p>
      
      
          </div>
      
      
      
      
      
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      
      
      
            {[
              {
                title: "Transport express",
                text: "Une solution pour vos besoins urgents lorsque votre livraison ne peut pas attendre. Contactez directement notre équipe pour une prise en charge rapide.",
                link: "/transport-express"
              },
      
              {
                title: "Tournées régulières",
                text: "Une organisation adaptée aux entreprises ayant besoin de livraisons planifiées chaque jour, chaque semaine ou selon un planning défini.",
                link: "/tournees-regulieres"
              },
      
              {
                title: "Transport dédié",
                text: "Une solution personnalisée avec une organisation construite autour de vos contraintes, vos volumes et votre activité.",
                link: "/transport-dedie"
              },
      
              {
                title: "Transport de marchandises",
                text: "L’acheminement de vos colis, équipements ou marchandises avec une solution adaptée à votre besoin.",
                link: "/transport-marchandises"
              },
      
              {
                title: "Logistique événementielle",
                text: "Transport et acheminement de matériel, équipements ou biens nécessaires à vos événements professionnels ou personnels.",
                link: "/logistique-evenementielle"
              },
      
              {
                title: "Transport national & européen",
                text: "Des solutions de transport depuis l’Île-de-France vers la France et l’Europe pour vos besoins ponctuels ou réguliers.",
                link: "/transport-national"
              }
      
            ].map((service,index)=>(
      
      
              <div
                key={index}
                className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col"
              >
      
      
                <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mb-6">
      
                  <div className="w-5 h-5 bg-white rounded-full"></div>
      
                </div>
      
      
      
      
                <h3 className="text-2xl font-bold mb-4">
                  {service.title}
                </h3>
      
      
      
      
                <p className="text-gray-600 leading-relaxed flex-grow">
      
                  {service.text}
      
                </p>
      
      
      
      
      
                <a
                  href={service.link}
                  className="mt-8 inline-flex items-center text-orange-500 font-bold hover:text-orange-600 transition"
                >
      
                  Découvrir le service →
      
                </a>
      
      
      
              </div>
      
      
            ))}
      
      
      
          </div>
      
      
      
        </div>
      
      
      </section>

      {/* Moyens de transport */}
      
      <section className="py-24 px-6 bg-white">
      
        <div className="max-w-7xl mx-auto">
      
      
          <div className="text-center mb-16">
      
            <p className="text-orange-500 font-bold uppercase tracking-widest">
              Nos moyens
            </p>
      
      
            <h2 className="text-3xl md:text-5xl font-black mt-4">
              Des véhicules adaptés à chaque volume
            </h2>
      
      
            <p className="mt-5 text-gray-600 text-lg">
              Flashride Logistics dispose de solutions de transport adaptées
              aux différents besoins de livraison, de marchandises et de logistique.
            </p>
      
          </div>
      
      
      
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
      
      
            {[
              {
                title: "Deux roues",
                volume: "Petits volumes",
                text: "Idéal pour les plis, documents, petits colis et livraisons urbaines."
              },
              {
                title: "Véhicule léger",
                volume: "Jusqu’à 6m³",
                text: "Adapté aux livraisons professionnelles et marchandises de faible volume."
              },
              {
                title: "Fourgon",
                volume: "12 à 14m³",
                text: "Une capacité intermédiaire pour vos besoins réguliers et transports polyvalents."
              },
              {
                title: "Grand volume",
                volume: "20m³ avec hayon",
                text: "Solution adaptée aux palettes, équipements, événements et volumes importants."
              }
            ].map((vehicle, index) => (
      
      
              <div
                key={index}
                className="bg-gray-100 rounded-3xl p-8 hover:shadow-xl transition"
              >
      
      
                <div className="w-14 h-14 bg-[#0B1F3A] rounded-2xl mb-6 flex items-center justify-center">
      
                  <div className="w-5 h-5 bg-orange-500 rounded-full"></div>
      
                </div>
      
      
                <h3 className="text-2xl font-bold">
                  {vehicle.title}
                </h3>
      
      
                <p className="text-orange-500 font-bold mt-2">
                  {vehicle.volume}
                </p>
      
      
                <p className="text-gray-600 mt-4 leading-relaxed">
                  {vehicle.text}
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
      
            <h2 className="text-3xl md:text-5xl font-black mt-4">
              Pourquoi choisir Flashride Logistics ?
            </h2>
      
          </div>
      
      
      
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      
      
            {[
              [
                "01",
                "Fiabilité",
                "Une organisation rigoureuse pour garantir des prestations sécurisées et ponctuelles."
              ],
              [
                "02",
                "Flexibilité",
                "Des solutions adaptées aux contraintes des entreprises comme aux besoins des particuliers."
              ],
              [
                "03",
                "Réactivité",
                "Une prise en charge efficace avec une organisation adaptée à chaque mission."
              ],
              [
                "04",
                "Sur mesure",
                "Un accompagnement personnalisé selon vos volumes, délais et contraintes."
              ]
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
      
      
            <h2 className="text-3xl md:text-5xl font-black mt-5 leading-tight">
              Un partenaire transport
              pensé pour chaque mission.
            </h2>
      
      
            <p className="mt-8 text-gray-300 text-lg leading-relaxed">
      
              Flashride Logistics accompagne entreprises et particuliers avec
              des solutions de transport et de logistique adaptées. Notre objectif :
              proposer un service fiable, organisé et flexible, quel que soit le besoin.
      
            </p>
      
      
            <p className="mt-5 text-gray-300 text-lg leading-relaxed">
      
              Grâce à une gamme de moyens de transport allant du deux roues au
              grand volume 20m³ avec hayon, nous répondons aux demandes ponctuelles,
              aux tournées régulières et aux prestations événementielles.
      
            </p>
      
      
          </div>
      
      
      
          <img
            src="/images/carte.jpg"
            alt="Flashride Logistics transport et logistique"
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
      
      
            <h2 className="text-3xl md:text-5xl font-black mt-4 leading-tight">
              Obtenez votre solution de transport personnalisée
            </h2>
      
      
            <p className="mt-5 text-gray-600 text-lg">
              Décrivez votre projet. Flashride Logistics vous accompagne avec
              une solution adaptée à votre activité, vos délais et votre volume.
            </p>
      
      
          </div>
      
      
      
          <form
              onSubmit={handleSubmit}
              className="bg-white rounded-3xl shadow-xl p-8 grid md:grid-cols-2 gap-6"
            >
      
      
            <select
              name="prestation"
              className="border rounded-xl p-4 md:col-span-2"
            >
              <option>Type de prestation</option>
              <option>Tournée régulière</option>
              <option>Transport express</option>
              <option>Transport dédié</option>
              <option>Transport de marchandises</option>
              <option>Logistique événementielle</option>
              <option>Sous-traitance transport</option>
            </select>
      
      
      
            <select
              name="client"
              className="border rounded-xl p-4"
            >
              <option>Vous êtes</option>
              <option>Entreprise</option>
              <option>Particulier</option>
            </select>
      
      
      
              <select
                name="vehicule"
                className="border rounded-xl p-4"
              >
              <option>Type de véhicule souhaité</option>
              <option>2 roues</option>
              <option>Véhicule léger jusqu'à 6m³</option>
              <option>Fourgon 12/14m³</option>
              <option>Grand volume 20m³ avec hayon</option>
              <option>Besoin à définir</option>
            </select>
      
      
      
            <input
              name="nom"
              className="border rounded-xl p-4"
              placeholder="Nom / Entreprise"
            />
      
      
            <input
              name="telephone"
              className="border rounded-xl p-4"
              placeholder="Téléphone"
            />
      
      
            <input
              name="email"
              className="border rounded-xl p-4"
              placeholder="Email"
            />
      
      
            <div>
  <label className="block font-semibold mb-2">
    Date souhaitée du transport
  </label>

  <input
    name="date"
    type="date"
    className="border rounded-xl p-4 w-full"
  />
</div>
      
      
      
            <input
              name="volume"
              className="border rounded-xl p-4"
              placeholder="Volume (colis, palettes, dimensions)"
            />
      
      
            <input
              name="depart"
              className="border rounded-xl p-4"
              placeholder="Ville de départ"
            />
      
      
            <input
              name="arrivee"
              className="border rounded-xl p-4"
              placeholder="Ville d'arrivée"
            />
      
      
            <input
              name="marchandise"
              className="border rounded-xl p-4 md:col-span-2"
              placeholder="Type de marchandise"
            />
      
      
      
            <textarea
              name="message"
              className="border rounded-xl p-4 md:col-span-2"
              placeholder="Décrivez votre besoin (horaires, contraintes, informations complémentaires...)"
              rows="5"
            />
      
      
      
            <button
              type="submit"
              className="bg-orange-500 text-white font-bold text-lg rounded-xl p-4 md:col-span-2 hover:bg-orange-600 transition"
            >
              Recevoir ma proposition
            </button>
      
      
          </form>
              {sent && (
          <div className="mt-6 bg-green-100 text-green-700 p-4 rounded-xl text-center font-semibold">
            ✅ Votre demande a bien été envoyée. Notre équipe vous recontactera sous 24h.
          </div>
        )}
      
        </div>
      
      </section>



      {/* Contact */}
      
      <section id="contact" className="py-20 px-6 bg-white">
         <div className="max-w-6xl mx-auto text-center">
    
      <p className="text-orange-500 font-bold uppercase tracking-widest">
        Contact
      </p>
    
      <h2 className="text-3xl md:text-5xl font-black mt-4">
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
