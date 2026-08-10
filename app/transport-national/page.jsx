"use client";

import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import FAQ from "../components/FAQ";

export default function TransportNational() {
  return (
    <main className="bg-white text-gray-900 min-h-screen">

      {/* NAVIGATION */}
      <Navbar />

      {/* HERO */}
      <section className="pt-24 pb-16 px-6 bg-gradient-to-br from-black via-[#0B1F3A] to-black text-white">

        <div className="max-w-6xl mx-auto">

          <p className="text-orange-400 font-bold uppercase tracking-widest">
            TRANSPORT NATIONAL & EUROPÉEN
          </p>

          <h1 className="text-4xl md:text-5xl font-black mt-4 leading-tight">
            Vos marchandises transportées en France et en Europe.
          </h1>

          <p className="mt-6 text-gray-300 text-lg md:text-xl max-w-3xl leading-relaxed">
            Flashride Logistics accompagne professionnels et particuliers
            pour leurs besoins de transport au-delà des frontières.
            De l’Île-de-France vers la France et l’Europe, nous adaptons
            nos solutions selon vos délais, vos volumes et vos contraintes.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">

            <a
              href="tel:0752988155"
              className="bg-orange-500 px-7 py-3.5 rounded-xl font-bold text-base hover:bg-orange-600 transition"
            >
              📞 Contacter notre équipe
            </a>

            <a
              href="/#devis"
              className="border border-white/40 px-7 py-3.5 rounded-xl font-bold text-base hover:bg-white hover:text-black transition"
            >
              Demander un devis
            </a>

          </div>

        </div>

      </section>

      {/* PRESENTATION */}
      <section className="py-16 px-6">

        <div className="max-w-6xl mx-auto">

          <h2 className="text-3xl md:text-4xl font-black text-center">
            Une solution adaptée à vos transports en France et en Europe
          </h2>

          <p className="mt-6 text-gray-600 text-lg text-center max-w-3xl mx-auto">
            Que vous soyez une entreprise ou un particulier,
            Flashride Logistics organise vos transports avec une approche
            adaptée à votre besoin, votre destination et vos contraintes.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mt-10">

            {[
              {
                title: "Départs Île-de-France",
                text: "Une organisation au départ de votre zone d’activité vers vos destinations nationales et européennes."
              },
              {
                title: "Transport en France",
                text: "Des solutions adaptées pour vos livraisons ponctuelles, régulières ou vos besoins spécifiques."
              },
              {
                title: "Transport européen",
                text: "Un accompagnement pour vos transports vers les pays européens selon votre projet et vos contraintes."
              }
            ].map((item, index) => (

              <div
                key={index}
                className="bg-gray-100 rounded-2xl p-6"
              >

                <h3 className="text-xl font-bold">
                  {item.title}
                </h3>

                <p className="mt-3 text-gray-600 leading-relaxed">
                  {item.text}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-[#0B1F3A] text-white text-center">

        <div className="max-w-5xl mx-auto">

          <h2 className="text-3xl md:text-4xl font-black">
            Un transport à organiser en France ou en Europe ?
          </h2>

          <p className="mt-4 text-gray-300 text-lg">
            Notre équipe vous accompagne pour trouver une solution adaptée
            à votre destination, vos délais et votre volume.
          </p>

          <a
            href="tel:0752988155"
            className="inline-block mt-7 bg-orange-500 px-7 py-3.5 rounded-xl font-bold hover:bg-orange-600 transition"
          >
            Contacter notre équipe
          </a>

        </div>

      </section>

      <FAQ
        items={[
          {
            question: "Quelles zones couvrez-vous en dehors de l'Île-de-France ?",
            answer:
              "L'ensemble du territoire français, avec une organisation adaptée selon la distance et le volume à transporter."
          },
          {
            question: "Livrez-vous aussi en Europe ?",
            answer:
              "Oui, pour des besoins ponctuels ou réguliers vers l'Europe, contactez-nous pour étudier votre demande."
          }
        ]}
      />

      {/* FOOTER */}
      <Footer />

    </main>
  );
}