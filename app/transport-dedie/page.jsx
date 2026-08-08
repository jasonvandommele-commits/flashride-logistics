"use client";

import { useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";


export default function TransportDedie() {

  
  return (

    <main className="bg-white text-gray-900 min-h-screen">


      {/* HEADER */}

      <Navbar />


      {/* HERO */}

      <section className="pt-32 pb-24 px-6 bg-gradient-to-br from-black via-[#0B1F3A] to-black text-white">


        <div className="max-w-6xl mx-auto">


          <p className="text-orange-400 font-bold uppercase tracking-widest">
            TRANSPORT DÉDIÉ
          </p>


          <h1 className="text-4xl md:text-6xl font-black mt-5 leading-tight">

            Un transport adapté à vos missions spécifiques.

          </h1>


          <p className="mt-8 text-gray-300 text-lg max-w-3xl leading-relaxed">

            Certaines missions nécessitent une organisation personnalisée.
            Flashride Logistics met en place une solution de transport dédiée
            selon vos contraintes, vos horaires et vos besoins opérationnels.

          </p>


          <div className="mt-10 flex flex-wrap gap-4">


            <a
              href="tel:0752988155"
              className="bg-orange-500 px-8 py-4 rounded-2xl font-bold"
            >
              📞 Contacter notre équipe
            </a>


            <a
              href="/#devis"
              className="border border-white/40 px-8 py-4 rounded-2xl font-bold"
            >
              Demander un devis
            </a>


          </div>


        </div>


      </section>





      {/* CONTENU */}

      <section className="py-20 px-6">


        <div className="max-w-6xl mx-auto">


          <h2 className="text-3xl md:text-5xl font-black text-center">
  Une solution construite autour de vos besoins
</h2>


<p className="mt-8 text-gray-600 text-lg text-center max-w-3xl mx-auto">

  Le transport dédié permet de bénéficier d’une organisation adaptée
  lorsqu’un besoin nécessite une prise en charge personnalisée.
  Que vous soyez une entreprise ou un particulier, Flashride Logistics
  met en place une solution pensée selon vos contraintes, vos délais,
  votre volume et les spécificités de votre mission.

</p>




          <div className="grid md:grid-cols-3 gap-8 mt-14">


            {[
              "Mission spécifique",
              "Organisation personnalisée",
              "Suivi professionnel"
            ].map((item,index)=>(


              <div
                key={index}
                className="bg-gray-100 rounded-3xl p-8"
              >

                <h3 className="text-xl font-bold">
                  {item}
                </h3>

                <p className="mt-4 text-gray-600">
                  Une solution adaptée à vos exigences et à votre fonctionnement.
                </p>


              </div>


            ))}


          </div>


        </div>


      </section>





      {/* CTA */}

      <section className="py-20 px-6 bg-[#0B1F3A] text-white text-center">


        <h2 className="text-3xl md:text-5xl font-black">

          Besoin d’une solution transport sur mesure ?

        </h2>


        <a
          href="tel:0752988155"
          className="inline-block mt-8 bg-orange-500 px-8 py-4 rounded-2xl font-bold"
        >
          Contacter notre équipe
        </a>


      </section>





      {/* FOOTER */}

      <Footer />


    </main>

  );

}
