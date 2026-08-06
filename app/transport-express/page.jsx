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

              Transport express :
              <span className="text-orange-500">
                {" "}une réponse rapide
              </span>

              <br />

              quand votre délai est essentiel.

            </h1>


            <p className="mt-8 text-gray-300 text-lg leading-relaxed">

              Besoin d’acheminer une marchandise rapidement ?
              Flashride Logistics organise vos transports express pour
              les professionnels et les particuliers avec une solution
              adaptée à votre urgence.

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


            <div className="mt-10 flex flex-wrap gap-8 text-sm text-gray-400">


              <div>
                <p className="text-white font-bold text-xl">
                  Express
                </p>
                Réactivité maximale
              </div>


              <div>
                <p className="text-white font-bold text-xl">
                  IDF
                </p>
                Départs fréquents
              </div>


              <div>
                <p className="text-white font-bold text-xl">
                  France
                </p>
                Couverture nationale
              </div>


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




      {/* COMPRENDRE LE SERVICE */}


      <section className="py-24 px-6 bg-gray-100">


        <div className="max-w-6xl mx-auto">


          <div className="text-center mb-14">


            <p className="text-orange-500 font-bold uppercase tracking-widest">
              Le transport express
            </p>


            <h2 className="text-3xl md:text-5xl font-black mt-4">
              Qu’est-ce qu’un transport express ?
            </h2>


          </div>



          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm">


            <p className="text-gray-600 text-lg leading-relaxed">

              Le transport express est une solution de livraison prioritaire
              destinée aux situations où le délai est un élément essentiel.
              Il permet d’organiser un acheminement rapide lorsque le transport
              classique ne correspond pas à votre besoin.

            </p>


            <p className="mt-6 text-gray-600 text-lg leading-relaxed">

              Il répond notamment aux demandes urgentes des entreprises,
              aux besoins ponctuels des particuliers, au transport de matériel,
              de pièces ou de marchandises nécessitant une prise en charge rapide.

            </p>


          </div>


        </div>


      </section>




      {/* QUESTIONS CLIENTS */}


      <section className="py-24 px-6 bg-white">


        <div className="max-w-7xl mx-auto">


          <div className="text-center mb-16">


            <p className="text-orange-500 font-bold uppercase tracking-widest">
              Vos besoins
            </p>


            <h2 className="text-3xl md:text-5xl font-black mt-4">
              Dans quelles situations faire appel à nous ?
            </h2>


          </div>
                    <div className="grid md:grid-cols-2 gap-8">


            {[
              {
                question: "Votre activité est bloquée par une urgence ?",
                answer:
                  "Une pièce manquante, un équipement indispensable ou une marchandise urgente doit être acheminée rapidement ? Nous organisons une solution adaptée à votre situation."
              },
              {
                question: "Votre client attend une livraison dans un délai court ?",
                answer:
                  "Nous vous accompagnons pour respecter vos engagements grâce à une organisation transport réactive et professionnelle."
              },
              {
                question: "Vous avez un besoin ponctuel sans solution logistique ?",
                answer:
                  "Flashride Logistics prend en charge vos transports occasionnels avec une prestation flexible adaptée à votre demande."
              },
              {
                question: "Vous êtes un particulier avec un transport urgent ?",
                answer:
                  "Nous accompagnons également les particuliers pour le transport de biens, équipements ou objets volumineux nécessitant une solution rapide."
              }
            ].map((item, index) => (

              <div
                key={index}
                className="bg-gray-100 rounded-3xl p-8 hover:shadow-xl transition"
              >

                <h3 className="text-2xl font-bold mb-4">
                  ❓ {item.question}
                </h3>

                <p className="text-gray-600 leading-relaxed">
                  {item.answer}
                </p>

              </div>

            ))}


          </div>


        </div>


      </section>




      {/* POURQUOI FLASHRIDE */}


      <section className="py-24 px-6 bg-black text-white">


        <div className="max-w-7xl mx-auto">


          <div className="text-center mb-16">


            <p className="text-orange-400 font-bold uppercase tracking-widest">
              Notre engagement
            </p>


            <h2 className="text-3xl md:text-5xl font-black mt-4">
              Pourquoi choisir Flashride Logistics ?
            </h2>


            <p className="mt-5 text-gray-300 text-lg">

              Un transport express nécessite une organisation fiable,
              une communication claire et une vraie réactivité.

            </p>


          </div>



          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">


            {[
              {
                title: "Réactivité",
                text: "Une prise en charge pensée pour les demandes urgentes."
              },
              {
                title: "Ponctualité",
                text: "Le respect des délais est au centre de nos missions."
              },
              {
                title: "Flexibilité",
                text: "Des solutions adaptées aux professionnels et particuliers."
              },
              {
                title: "Suivi",
                text: "Un accompagnement personnalisé selon votre besoin."
              }
            ].map((item, index) => (

              <div
                key={index}
                className="border border-white/10 rounded-3xl p-8 hover:bg-white/5 transition"
              >

                <h3 className="text-orange-500 text-xl font-bold">
                  {item.title}
                </h3>

                <p className="mt-4 text-gray-300 leading-relaxed">
                  {item.text}
                </p>

              </div>

            ))}


          </div>


        </div>


      </section>




      {/* FONCTIONNEMENT */}


      <section className="py-24 px-6 bg-gray-100">


        <div className="max-w-7xl mx-auto">


          <div className="text-center mb-16">


            <p className="text-orange-500 font-bold uppercase tracking-widest">
              Organisation
            </p>


            <h2 className="text-3xl md:text-5xl font-black mt-4">
              Comment fonctionne un transport express ?
            </h2>


          </div>



          <div className="grid md:grid-cols-4 gap-6">


            {[
              {
                number: "01",
                title: "Contact",
                text: "Vous nous expliquez votre besoin, votre délai et votre destination."
              },
              {
                number: "02",
                title: "Analyse",
                text: "Nous définissons le véhicule et l'organisation adaptés."
              },
              {
                number: "03",
                title: "Prise en charge",
                text: "Votre marchandise est récupérée selon les conditions prévues."
              },
              {
                number: "04",
                title: "Livraison",
                text: "Votre transport est réalisé avec suivi et professionnalisme."
              }
            ].map((step, index) => (

              <div
                key={index}
                className="bg-white rounded-3xl p-8 text-center shadow-sm"
              >

                <p className="text-orange-500 text-4xl font-black">
                  {step.number}
                </p>

                <h3 className="text-xl font-bold mt-4">
                  {step.title}
                </h3>

                <p className="text-gray-600 mt-3 leading-relaxed">
                  {step.text}
                </p>

              </div>

            ))}


          </div>


        </div>


      </section>
            {/* CTA FINAL */}

      <section className="py-24 px-6 bg-[#0B1F3A] text-white text-center">


        <div className="max-w-5xl mx-auto">


          <h2 className="text-3xl md:text-5xl font-black">

            Votre livraison ne peut pas attendre ?

          </h2>


          <p className="mt-6 text-gray-300 text-lg leading-relaxed">

            Pour un besoin urgent, le plus rapide est de nous contacter directement.
            Notre équipe étudie votre demande et vous propose une solution adaptée.

          </p>



          <div className="mt-10 flex flex-wrap justify-center gap-4">


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
              et particuliers. Des solutions adaptées aux transports
              express, tournées régulières et besoins spécifiques.

            </p>


          </div>




          <div>


            <h4 className="text-white font-bold mb-4">
              Nos prestations
            </h4>


            <ul className="space-y-2">

              <li>
                Transport express
              </li>

              <li>
                Tournées dédiées
              </li>

              <li>
                Transport marchandises
              </li>

              <li>
                Logistique événementielle
              </li>

            </ul>


          </div>




          <div>


            <h4 className="text-white font-bold mb-4">
              Zones d’intervention
            </h4>


            <ul className="space-y-2">

              <li>
                Paris
              </li>

              <li>
                Île-de-France
              </li>

              <li>
                France
              </li>

              <li>
                Europe
              </li>

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
              href="tel:0752988155"
              className="inline-block mt-5 bg-orange-500 text-white px-5 py-3 rounded-xl font-bold hover:bg-orange-600 transition"
            >
              Appeler
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