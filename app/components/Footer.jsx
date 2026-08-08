export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-black via-[#0B1F3A] to-black text-gray-400 py-12 px-6">
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
          <h4 className="text-white font-bold mb-4">Nos prestations</h4>
          <ul className="space-y-2">
            <li>Tournées dédiées</li>
            <li>Transport express</li>
            <li>Transport de marchandises</li>
            <li>Sous-traitance transport</li>
            <li>Logistique événementielle</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4">Zones d’intervention</h4>
          <ul className="space-y-2">
            <li>Paris</li>
            <li>Île-de-France</li>
            <li>France</li>
            <li>Europe</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4">Contact</h4>
          <p>📞 07 52 98 81 55</p>
          <p className="mt-2 text-sm text-gray-500">Transport assuré · Activité conforme à la réglementation</p>

          <a
            href="#devis"
            className="inline-block mt-5 bg-orange-500 text-white px-5 py-3 rounded-xl font-bold hover:bg-orange-600 transition"
          >
            Demander un devis
          </a>
        </div>

      </div>

      <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm">
        <p>© 2026 Flashride Logistics — Tous droits réservés.</p>

        <div className="mt-4 flex justify-center gap-6">
          <a href="/mentions-legales" className="hover:text-orange-500">
            Mentions légales
          </a>
          <a href="/confidentialite" className="hover:text-orange-500">
            Politique de confidentialité
          </a>
        </div>
      </div>
    </footer>
  );
}

