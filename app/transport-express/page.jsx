 export default function TransportExpress() {
  return (
    <main className="bg-white text-gray-900">

      {/* HERO */}
      <section className="bg-blue-700 text-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center px-6 py-20">

          <div>
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Transport express rapide et fiable
            </h1>

            <p className="text-lg text-blue-100 mb-8">
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


          <div>
            <img
              src="/images/IMG_0255.jpeg"
              alt="Transport express Flashride Logistics"
              className="rounded-3xl shadow-2xl w-full"
            />
          </div>

        </div>
      </section>


      {/* PRESENTATION */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">

          <div>
            <img
              src="/images/IMG_0265.png"
              alt="Livraison professionnelle"
              className="rounded-3xl shadow-lg"
            />
          </div>


          <div>
            <h2 className="text-3xl font-bold mb-5">
              Une solution pour vos transports urgents
            </h2>

            <p className="text-gray-600 text-lg leading-relaxed">
              Besoin d’une livraison rapide ? Flashride Logistics organise
              vos transports express avec réactivité et professionnalisme.
              Nous prenons en charge vos marchandises et assurons leur
              acheminement dans les meilleurs délais.
            </p>

          </div>

        </div>
      </section>


      {/* AVANTAGES */}
      <section className="bg-blue-50 py-20 px-6">

        <div className="max-w-7xl mx-auto">

          <h2 className="text-3xl font-bold text-center mb-12">
            Nos engagements
          </h2>


          <div className="grid md:grid-cols-4 gap-6">

            {[
              ["⚡", "Réactivité"],
              ["📍", "Ponctualité"],
              ["🔒", "Transport sécurisé"],
              ["🤝", "Suivi personnalisé"],
            ].map((item) => (
              <div
                key={item[1]}
                className="bg-white rounded-2xl p-8 shadow-sm text-center"
              >
                <div className="text-4xl mb-4">
                  {item[0]}
                </div>

                <h3 className="font-bold text-xl">
                  {item[1]}
                </h3>
              </div>
            ))}

          </div>

        </div>

      </section>


      {/* PROCESS */}
      <section className="py-20 px-6">

        <div className="max-w-6xl mx-auto">

          <h2 className="text-3xl font-bold text-center mb-12">
            Comment fonctionne notre service ?
          </h2>


          <div className="grid md:grid-cols-4 gap-6">

            {[
              "Demande de devis",
              "Organisation du transport",
              "Prise en charge",
              "Livraison",
            ].map((step, index) => (

              <div
                key={step}
                className="border rounded-2xl p-6 text-center"
              >
                <div className="bg-blue-700 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                  {index + 1}
                </div>

                <p className="font-semibold">
                  {step}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* CTA */}
      <section className="bg-blue-700 text-white text-center py-20 px-6">

        <h2 className="text-4xl font-bold mb-5">
          Besoin d’un transport express ?
        </h2>

        <p className="text-lg mb-8">
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