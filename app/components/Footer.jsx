export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-black via-[#0B1F3A] to-black text-gray-400 py-9 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">

        <div>
          <h3 className="text-white text-lg font-black">
            <span className="text-[#0B1F3A]">FLASH</span>
            <span className="text-orange-500">RIDE</span>
            <span className="text-white"> LOGISTICS</span>
          </h3>

          <p className="mt-3 leading-relaxed text-sm">
            Société de transport et logistique pour professionnels et particuliers.
            Des solutions adaptées aux tournées, livraisons, événements et besoins
            spécifiques.
          </p>

          {/* Réseaux sociaux */}
          <div className="mt-4 flex items-center gap-4">
            <a
              href="https://www.instagram.com/flashridelogistics.fr"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Flashride Logistics"
              className="hover:text-orange-500 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            {/* LinkedIn à ajouter prochainement ici */}
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3">Nos prestations</h4>

          <ul className="space-y-1.5 text-sm">
            <li>
              <a
                href="/transport-express"
                className="hover:text-orange-500 transition"
              >
                Transport express
              </a>
            </li>

            <li>
              <a
                href="/tournees-regulieres"
                className="hover:text-orange-500 transition"
              >
                Tournées régulières
              </a>
            </li>

            <li>
              <a
                href="/transport-dedie"
                className="hover:text-orange-500 transition"
              >
                Transport dédié
              </a>
            </li>

            <li>
              <a
                href="/transport-marchandises"
                className="hover:text-orange-500 transition"
              >
                Transport de marchandises
              </a>
            </li>

            <li>
              <a
                href="/logistique-evenementielle"
                className="hover:text-orange-500 transition"
              >
                Logistique événementielle
              </a>
            </li>

            <li>
              <a
                href="/transport-national"
                className="hover:text-orange-500 transition"
              >
                Transport national & européen
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3">
            Zones d'intervention
          </h4>

          <ul className="space-y-1.5 text-sm">
            <li>Paris</li>
            <li>Île-de-France</li>
            <li>France</li>
            <li>Europe</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3">Contact</h4>

          <p className="text-sm">📞 07 52 98 81 55</p>

          <p className="text-sm text-orange-400 font-semibold mt-1">
            Disponible 24h/24 · 7j/7
          </p>

          <p className="mt-1.5 text-sm">
            ✉ contact@flashride-logistics.fr
          </p>

          <p className="mt-1.5 text-xs text-gray-500">
            Transport assuré · Activité conforme à la réglementation
          </p>

          <a
            href="#devis"
            className="inline-block mt-4 bg-orange-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-600 transition"
          >
            Demander un devis
          </a>
        </div>

      </div>

      <div className="border-t border-gray-800 mt-8 pt-5 text-center text-sm">
        <p>© 2026 Flashride Logistics — Tous droits réservés.</p>

        <p className="mt-1.5 text-gray-500">
          SIRET : 101 518 934 00019
        </p>

        <div className="mt-3 flex justify-center gap-5">
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
  );
}