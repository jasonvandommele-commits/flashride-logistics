export default function FlashrideLogisticsWebsite() {
  return (
    <div className="bg-white text-gray-900 min-h-screen font-sans">
      {/* Hero */}
      <section className="bg-gradient-to-r from-black via-slate-900 to-black text-white py-24 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight">
              FLASHRIDE <span className="text-orange-400">LOGISTICS</span>
            </h1>
            <p className="mt-6 text-2xl text-gray-300 leading-relaxed">
              Votre partenaire transport partout en Europe.
            </p>
            <p className="mt-4 text-lg text-gray-400 max-w-xl">
              Solutions rapides, fiables et flexibles pour vos livraisons nationales et internationales.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="tel:0752988155"
                className="bg-orange-500 hover:bg-orange-600 transition px-8 py-4 rounded-2xl text-lg font-bold shadow-xl"
              >
                Appeler maintenant
              </a>

              <a
                href="mailto:contact@flashride-logistics.com"
                className="border border-white hover:bg-white hover:text-black transition px-8 py-4 rounded-2xl text-lg font-bold"
              >
                Envoyer un email
              </a>
            </div>
          </div>

          <div>
            <img
              src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=1200&auto=format&fit=crop"
              alt="Transport Europe"
              className="rounded-3xl shadow-2xl object-cover w-full h-[500px]"
            />
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 px-6 bg-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold">Nos Services</h2>
            <p className="mt-4 text-gray-600 text-lg">
              Transport national et international adapté à tous vos besoins.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              'Transport express',
              'Livraison palettes',
              'Marchandises générales',
              'Transport urgent',
              'Sous-traitance transport',
              'Livraison partout en Europe',
            ].map((service, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition"
              >
                <div className="w-14 h-14 rounded-2xl bg-orange-500 mb-6"></div>
                <h3 className="text-2xl font-bold mb-3">{service}</h3>
                <p className="text-gray-600 leading-relaxed">
                  Service professionnel, rapide et fiable avec disponibilité 7j/7.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <img
            src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=1200&auto=format&fit=crop"
            alt="Camion livraison"
            className="rounded-3xl shadow-2xl w-full h-[450px] object-cover"
          />

          <div>
            <h2 className="text-5xl font-bold leading-tight">
              Livraison rapide et sécurisée dans toute l’Europe
            </h2>

            <p className="mt-6 text-lg text-gray-600 leading-relaxed">
              Flashride Logistics accompagne les professionnels et particuliers avec des solutions de transport adaptées : express, marchandises, palettes et livraisons urgentes.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-6">
              <div className="bg-gray-100 rounded-2xl p-6">
                <h3 className="text-4xl font-bold text-orange-500">24/7</h3>
                <p className="mt-2 text-gray-600">Disponibilité</p>
              </div>

              <div className="bg-gray-100 rounded-2xl p-6">
                <h3 className="text-4xl font-bold text-orange-500">Europe</h3>
                <p className="mt-2 text-gray-600">Couverture complète</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-black text-white py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl font-bold">Contactez-nous</h2>
          <p className="mt-6 text-xl text-gray-300">
            Besoin d’un transport rapide et fiable ?
          </p>

          <div className="mt-12 grid md:grid-cols-3 gap-8 text-lg">
            <div className="bg-gray-900 p-8 rounded-3xl">
              <p className="font-bold text-orange-400 mb-2">Téléphone</p>
              <p>07 52 98 81 55</p>
            </div>

            <div className="bg-gray-900 p-8 rounded-3xl">
              <p className="font-bold text-orange-400 mb-2">Email</p>
              <p className="break-all">contact@flashride-logistics.com</p>
            </div>

            <div className="bg-gray-900 p-8 rounded-3xl">
              <p className="font-bold text-orange-400 mb-2">Localisation</p>
              <p>Île-de-France</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-8 text-center text-sm">
        © 2026 Flashride Logistics — Transport National & International
      </footer>
    </div>
  )
}
