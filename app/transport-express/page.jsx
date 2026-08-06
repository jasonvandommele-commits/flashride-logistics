export default function TransportExpress() {
  return (
    <main className="bg-white text-gray-900 min-h-screen">


      {/* HERO */}
      <section className="pt-20 md:pt-24 bg-gradient-to-br from-black via-[#0B1F3A] to-black text-white">

        <div className="max-w-7xl mx-auto px-6 py-12 md:py-24 grid lg:grid-cols-2 gap-12 items-center">

          <div>

            <p className="text-orange-400 font-bold uppercase tracking-[0.2em] mb-5">
              TRANSPORT EXPRESS
            </p>


            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight">

              Transport express rapide
              <span className="text-orange-500">
                {" "}et fiable
              </span>

              <br />

              quand chaque minute compte.

            </h1>


            <p className="mt-8 text-gray-300 text-lg leading-relaxed">

              Flashride Logistics accompagne les professionnels et les particuliers
              avec des solutions de transport express adaptées aux urgences,
              aux délais courts et aux contraintes spécifiques.

            </p>


            <div className="mt-10 flex flex-wrap gap-4">


              <a
                href="tel:0752988155"
                className="bg-orange-500 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 transition"
              >
                📞 Appeler maintenant
              </a>


              <a
                href="/#devis"
                className="border border-white/40 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-black transition"
              >
                Demander un devis
              </a>


            </div>


          </div>



          <div className="relative">

            <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full"></div>


            <img
              src="/images/IMG_0255.jpeg"
              alt="Transport express Flashride Logistics"
              className="relative rounded-3xl shadow-2xl w-full h-[520px] object-cover"
            />


          </div>


        </div>

      </section>



      {/* EXPLICATION */}

      <section className="py-24 px-6 bg-gray-100">

        <div className="max-w-7xl mx-auto">


          <div className="text-center mb-16">

            <p className="text-orange-500 font-bold uppercase tracking-widest">
              Comprendre le transport express
            </p>


            <h2 className="text-3xl md:text-5xl font-black mt-4">
              Une solution pour vos livraisons urgentes
            </h2>

          </div>



          <div className="grid lg:grid-cols-2 gap-10">


            <div className="bg-white rounded-3xl p-10 shadow-sm">

              <h3 className="text-2xl font-bold mb-5">
                Qu’est-ce qu’un transport express ?
              </h3>


              <p className="text-gray-600 leading-relaxed">

                Le transport express est une solution de livraison prioritaire
                permettant d’acheminer une marchandise dans des délais courts.
                Contrairement à un transport classique, il répond aux situations
                où la rapidité et la disponibilité sont essentielles.

              </p>

            </div>



            <div className="bg-white rounded-3xl p-10 shadow-sm">

              <h3 className="text-2xl font-bold mb-5">
                Pourquoi choisir l’express ?
              </h3>


              <p className="text-gray-600 leading-relaxed">

                Une livraison urgente peut éviter un arrêt d’activité, répondre
                à un besoin client ou permettre l’acheminement rapide d’une
                marchandise importante.

              </p>

            </div>


          </div>


        </div>

      </section>




      {/* CAS UTILISATION */}

      <section className="py-24 px-6 bg-white">


        <div className="max-w-7xl mx-auto">


          <div className="text-center mb-16">

            <p className="text-orange-500 font-bold uppercase tracking-widest">
              Nos interventions
            </p>


            <h2 className="text-3xl md:text-5xl font-black mt-4">
              Dans quelles situations utiliser un transport express ?
            </h2>

          </div>



          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">


            {[
              [
                "Entreprises",
                "Livraisons urgentes, approvisionnement, besoins professionnels."
              ],
              [
                "Industrie",
                "Transport de pièces ou équipements indispensables."
              ],
              [
                "Événements",
                "Acheminement de matériel pour salons et manifestations."
              ],
              [
                "Particuliers",
                "Transport ponctuel d’objets volumineux ou équipements."
              ]
            ].map((item,index)=>(


              <div
                key={index}
                className="bg-gray-100 rounded-3xl p-8 hover:shadow-xl transition"
              >

                <div className="w-14 h-14 bg-[#0B1F3A] rounded-2xl mb-6 flex items-center justify-center">

                  <div className="w-5 h-5 bg-orange-500 rounded-full"></div>

                </div>


                <h3 className="text-xl font-bold mb-3">
                  {item[0]}
                </h3>


                <p className="text-gray-600">
                  {item[1]}
                </p>


              </div>


            ))}


          </div>


        </div>


      </section>




      {/* AVANTAGES */}

      <section className="py-24 px-6 bg-black text-white">


        <div className="max-w-7xl mx-auto">


          <div className="text-center mb-16">

            <p className="text-orange-400 font-bold uppercase tracking-widest">
              Flashride Logistics
            </p>


            <h2 className="text-3xl md:text-5xl font-black mt-4">
              Pourquoi nous confier votre transport express ?
            </h2>


          </div>



          <div className="grid md:grid-cols-4 gap-6">


            {[
              "Réactivité",
              "Ponctualité",
              "Suivi personnalisé",
              "Solutions adaptées"
            ].map((text,index)=>(


              <div
                key={index}
                className="border border-white/10 rounded-3xl p-8 text-center"
              >

                <h3 className="text-xl font-bold text-orange-500">
                  {text}
                </h3>

              </div>


            ))}


          </div>


        </div>


      </section>




      {/* CTA */}

      <section className="py-24 px-6 bg-[#0B1F3A] text-white text-center">


        <h2 className="text-4xl md:text-5xl font-black">
          Votre livraison ne peut pas attendre ?
        </h2>


        <p className="mt-6 text-gray-300 text-lg">
          Contactez directement notre équipe pour organiser votre transport express.
        </p>



        <div className="mt-10 flex justify-center gap-4 flex-wrap">


          <a
            href="tel:0752988155"
            className="bg-orange-500 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-orange-600"
          >
            📞 07 52 98 81 55
          </a>


          <a
            href="/#devis"
            className="border border-white/40 px-8 py-4 rounded-2xl font-bold hover:bg-white hover:text-black"
          >
            Demander un devis
          </a>


        </div>


      </section>


    </main>
  );
}