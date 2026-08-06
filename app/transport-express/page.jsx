export default function TransportExpress() {
  return (
    <main className="bg-white text-gray-900">

      {/* Hero */}
      <section className="bg-blue-700 text-white py-24 px-6">
        <div className="max-w-6xl mx-auto">

          <h1 className="text-5xl font-bold mb-6">
            Transport express rapide et fiable
          </h1>

          <p className="text-xl max-w-3xl mb-8">
            Flashride Logistics accompagne les professionnels et les particuliers
            avec des solutions de transport express adaptées à vos besoins,
            en Île-de-France et partout en France.
          </p>

          <a
            href="/#devis"
            className="inline-block bg-white text-blue-700 font-semibold px-8 py-4 rounded-xl"
          >
            Demander un devis
          </a>

        </div>
      </section>


      {/* Présentation */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">

          <div>
            <h2 className="text-3xl font-bold mb-5">
              Une solution pour vos transports urgents
            </h2>

            <p className="text-lg text-gray-600">
              Besoin d’une livraison rapide ? Flashride Logistics organise
              vos transports express avec réactivité et professionnalisme.
              Nous prenons en charge vos marchandises et assurons leur
              acheminement dans les meilleurs délais.
            </p>
          </div>

          <div className="bg-gray-100 rounded-2xl p-10">
            <h3 className="text-2xl font-semibold mb-4">
              Nos engagements
            </h3>

            <ul className="space-y-3 text-gray-700">
              <li>✓ Réactivité</li>
              <li>✓ Ponctualité</li>
              <li>✓ Transport sécurisé</li>
              <li>✓ Suivi personnalisé</li>
            </ul>
          </div>

        </div>
      </section>


      {/* Services */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-6xl mx-auto">

          <h2 className="text-3xl font-bold mb-10 text-center">
            Nos solutions de transport express
          </h2>

          <div className="grid md:grid-cols-3 gap-6">

            <div className="bg-white p-8 rounded-2xl shadow">
              <h3 className="text-xl font-bold mb-3">
                Livraison urgente
              </h3>
              <p>
                Pour vos besoins nécessitant une prise en charge rapide.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow">
              <h3 className="text-xl font-bold mb-3">
                Professionnels
              </h3>
              <p>
                Solutions adaptées aux entreprises et besoins réguliers.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow">
              <h3 className="text-xl font-bold mb-3">
                Particuliers
              </h3>
              <p>
                Transport de biens, équipements et objets volumineux.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* CTA */}
      <section className="bg-blue-700 text-white py-20 px-6 text-center">

        <h2 className="text-4xl font-bold mb-5">
          Besoin d’un transport express ?
        </h2>

        <p className="mb-8 text-lg">
          Obtenez rapidement votre devis personnalisé.
        </p>

        <a
          href="/#devis"
          className="bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold"
        >
          Faire une demande
        </a>

      </section>

    </main>
  );
}
