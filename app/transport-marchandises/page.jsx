"use client";

import { useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";


export default function TransportMarchandises() {

  
  return (

    <main className="bg-white text-gray-900 min-h-screen">


      {/* HEADER */}

      <Navbar />


      {/* HERO */}

      <section className="pt-32 pb-24 px-6 bg-gradient-to-br from-black via-[#0B1F3A] to-black text-white">


        <div className="max-w-6xl mx-auto">


          <p className="text-orange-400 font-bold uppercase tracking-widest">
            TRANSPORT DE MARCHANDISES
          </p>


          <h1 className="text-4xl md:text-6xl font-black mt-5 leading-tight">

            Transporter vos marchandises en toute simplicité.

          </h1>


          <p className="mt-8 text-gray-300 text-lg max-w-3xl leading-relaxed">

            Qu’il s’agisse de marchandises professionnelles,
            d’équipements, de meubles ou d’objets volumineux,
            Flashride Logistics assure leur transport avec une
            organisation adaptée à votre situation.

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

            Une solution adaptée à chaque besoin

          </h2>


          <p className="mt-8 text-gray-600 text-lg text-center max-w-3xl mx-auto">

            Flashride Logistics accompagne aussi bien les professionnels
            que les particuliers pour le transport de marchandises,
            avec une prestation adaptée aux contraintes de chaque mission.

          </p>




          <div className="grid md:grid-cols-3 gap-8 mt-14">


            {[
              {
                title:"Professionnels",
                text:"Transport de marchandises, équipements et besoins réguliers pour accompagner votre activité."
              },
              {
                title:"Particuliers",
                text:"Transport de meubles, objets volumineux ou biens nécessitant un véhicule adapté."
              },
              {
                title:"Besoins spécifiques",
                text:"Une organisation personnalisée selon le volume, les délais et les contraintes."
              }
            ].map((item,index)=>(


              <div
                key={index}
                className="bg-gray-100 rounded-3xl p-8"
              >

                <h3 className="text-2xl font-bold">
                  {item.title}
                </h3>


                <p className="mt-4 text-gray-600 leading-relaxed">
                  {item.text}
                </p>


              </div>


            ))}


          </div>


        </div>


      </section>





      {/* CTA */}

      <section className="py-20 px-6 bg-[#0B1F3A] text-white text-center">


        <h2 className="text-3xl md:text-5xl font-black">

          Besoin de transporter une marchandise ?

        </h2>


        <p className="mt-5 text-gray-300 text-lg">
          Notre équipe vous accompagne pour trouver la solution adaptée.
        </p>


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
