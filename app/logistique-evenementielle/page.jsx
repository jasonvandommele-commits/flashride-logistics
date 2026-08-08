"use client";

import { useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import FAQ from "../components/FAQ";


export default function LogistiqueEvenementielle() {



  return (

    <main className="bg-white text-gray-900 min-h-screen">


      {/* HEADER */}

     <Navbar />

      {/* HERO */}


      <section className="pt-32 pb-24 px-6 bg-gradient-to-br from-black via-[#0B1F3A] to-black text-white">


        <div className="max-w-6xl mx-auto">


          <p className="text-orange-400 font-bold uppercase tracking-widest">
            LOGISTIQUE ÉVÉNEMENTIELLE
          </p>


          <h1 className="text-4xl md:text-6xl font-black mt-5 leading-tight">

            Transporter vos événements, de la préparation à la réalisation.

          </h1>


          <p className="mt-8 text-gray-300 text-lg max-w-3xl leading-relaxed">

            Un événement demande une organisation précise.
            Flashride Logistics vous accompagne dans l’acheminement
            de votre matériel, équipements ou biens nécessaires au bon
            déroulement de votre projet.

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

            Une logistique adaptée à chaque événement

          </h2>


          <p className="mt-8 text-gray-600 text-lg text-center max-w-3xl mx-auto">

            Que vous soyez une entreprise, un organisateur ou un particulier,
            Flashride Logistics met en place une solution adaptée à vos besoins
            de transport et d’acheminement.

          </p>




          <div className="grid md:grid-cols-3 gap-8 mt-14">


            {[
              {
                title:"Entreprises",
                text:"Transport de matériel, équipements, stands et besoins liés à vos événements professionnels."
              },
              {
                title:"Organisateurs",
                text:"Une solution flexible pour faciliter la préparation et la réalisation de vos événements."
              },
              {
                title:"Particuliers",
                text:"Transport d’équipements, mobilier ou objets nécessaires à vos projets personnels."
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

          Un événement à organiser ?

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


<FAQ items={[
  {
    question: "Intervenez-vous pour des événements privés et professionnels ?",
    answer: "Oui, nous accompagnons aussi bien les particuliers que les entreprises pour l'acheminement de matériel événementiel."
  },
  {
    question: "Combien de temps à l'avance dois-je réserver ?",
    answer: "Nous recommandons de nous contacter dès que possible, idéalement plusieurs jours avant l'événement, pour garantir la disponibilité."
  }
]} />



      {/* FOOTER */}


     <Footer />


    </main>

  );

}
