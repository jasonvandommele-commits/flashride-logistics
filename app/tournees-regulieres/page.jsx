"use client";

import { useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import FAQ from "../components/FAQ";


export default function TourneesRegulieres() {



  return (

    <main className="bg-white text-gray-900 min-h-screen">


      {/* NAVIGATION */}

      <Navbar />


      {/* HERO */}

      <section className="relative pt-24 min-h-[650px] flex items-center bg-gradient-to-br from-black via-[#0B1F3A] to-black text-white">


        <div className="max-w-7xl mx-auto px-6 py-20">


          <p className="text-orange-400 font-bold uppercase tracking-[0.2em] mb-5">
            TOURNÉES RÉGULIÈRES
          </p>



          <h1 className="text-4xl md:text-6xl font-black leading-tight max-w-4xl">

            Des livraisons planifiées pour accompagner votre activité au quotidien.

          </h1>



          <p className="mt-8 text-gray-200 text-lg md:text-xl leading-relaxed max-w-3xl">

            Vous avez besoin d’un transport fiable chaque jour, chaque semaine
            ou selon un planning défini ? Flashride Logistics organise vos
            tournées régulières avec une solution adaptée à votre volume,
            vos contraintes horaires et vos exigences opérationnelles.

          </p>



          <div className="mt-10 flex flex-wrap gap-4">


            <a
              href="tel:0752988155"
              className="bg-orange-500 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 transition"
            >
              📞 Parler à notre équipe
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
      
      {/* IDENTIFICATION DU BESOIN */}

      <section className="py-20 px-6 bg-gray-100">


        <div className="max-w-6xl mx-auto">


          <div className="text-center mb-14">


            <p className="text-orange-500 font-bold uppercase tracking-widest">
              Votre situation
            </p>


            <h2 className="text-3xl md:text-5xl font-black mt-4">
              Votre activité nécessite des livraisons régulières ?
            </h2>


            <p className="mt-5 text-gray-600 text-lg max-w-3xl mx-auto">

              Lorsque les besoins de transport deviennent récurrents,
              une organisation fiable permet de gagner du temps et de
              se concentrer sur son activité principale.

            </p>


          </div>




          <div className="grid md:grid-cols-2 gap-8">



            {[
              {
                title: "Des livraisons quotidiennes à assurer",
                text: "Vous avez besoin d’une solution stable pour vos livraisons clients, collectes ou distributions."
              },
              {
                title: "Une activité qui demande de la régularité",
                text: "Vos besoins évoluent mais nécessitent une organisation de transport planifiée."
              },
              {
                title: "Besoin d’externaliser votre transport",
                text: "Confiez vos tournées à un partenaire spécialisé sans gérer toute la logistique en interne."
              },
              {
                title: "Une organisation logistique à simplifier",
                text: "Bénéficiez d’une solution adaptée à vos horaires, vos volumes et vos contraintes."
              }
            ].map((item,index)=>(


              <div
                key={index}
                className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition"
              >


                <h3 className="text-2xl font-bold mb-4">
                  {item.title}
                </h3>


                <p className="text-gray-600 leading-relaxed">
                  {item.text}
                </p>


              </div>


            ))}


          </div>


        </div>


      </section>


      {/* EXPLICATION SERVICE */}


      <section className="py-24 px-6 bg-white">


        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">


          <div>


            <p className="text-orange-500 font-bold uppercase tracking-widest">
              Notre solution
            </p>


            <h2 className="text-3xl md:text-5xl font-black mt-4 leading-tight">

              Une organisation pensée pour vos besoins récurrents.

            </h2>


            <p className="mt-6 text-gray-600 text-lg leading-relaxed">

              Les tournées régulières permettent aux entreprises de bénéficier
              d’un service de transport organisé et adapté à leur fonctionnement.
              Flashride Logistics accompagne vos besoins de livraison,
              collecte ou distribution avec une solution construite autour
              de vos contraintes.

            </p>


            <p className="mt-5 text-gray-600 text-lg leading-relaxed">

              Qu’il s’agisse de quelques passages par semaine ou d’une
              organisation quotidienne, nous adaptons notre prestation
              à votre activité.

            </p>


          </div>




          <div className="bg-[#0B1F3A] rounded-3xl p-10 text-white">


            <h3 className="text-2xl font-bold mb-6">
              Les avantages d’une tournée régulière
            </h3>


            <ul className="space-y-5">


              <li className="flex gap-3">
                <span className="text-orange-500 font-bold">✓</span>
                Une organisation stable pour votre activité
              </li>


              <li className="flex gap-3">
                <span className="text-orange-500 font-bold">✓</span>
                Une meilleure anticipation de vos besoins
              </li>


              <li className="flex gap-3">
                <span className="text-orange-500 font-bold">✓</span>
                Une solution adaptée à vos contraintes
              </li>


              <li className="flex gap-3">
                <span className="text-orange-500 font-bold">✓</span>
                Un partenaire transport sur la durée
              </li>


            </ul>


          </div>


        </div>


      </section>
            {/* FONCTIONNEMENT */}

      <section className="py-24 px-6 bg-gray-100">

        <div className="max-w-6xl mx-auto">


          <div className="text-center mb-14">

            <p className="text-orange-500 font-bold uppercase tracking-widest">
              Notre fonctionnement
            </p>


            <h2 className="text-3xl md:text-5xl font-black mt-4">
              Mettre en place vos tournées simplement
            </h2>


          </div>



          <div className="grid md:grid-cols-3 gap-8">


            {[
              {
                number: "01",
                title: "Analyse de vos besoins",
                text: "Nous étudions vos volumes, vos fréquences de livraison et vos contraintes."
              },
              {
                number: "02",
                title: "Organisation du planning",
                text: "Nous définissons une solution adaptée à votre activité et à vos horaires."
              },
              {
                number: "03",
                title: "Réalisation des tournées",
                text: "Vos livraisons sont réalisées selon l’organisation mise en place."
              }
            ].map((item,index)=>(

              <div
                key={index}
                className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition"
              >

                <p className="text-orange-500 text-4xl font-black">
                  {item.number}
                </p>


                <h3 className="text-2xl font-bold mt-4">
                  {item.title}
                </h3>


                <p className="text-gray-600 mt-4 leading-relaxed">
                  {item.text}
                </p>


              </div>

            ))}


          </div>


        </div>

      </section>





      {/* CTA FINAL */}

      <section className="py-20 px-6 bg-[#0B1F3A] text-white">


        <div className="max-w-5xl mx-auto text-center">


          <h2 className="text-3xl md:text-5xl font-black">

            Besoin d’un partenaire transport pour vos tournées ?

          </h2>


          <p className="mt-6 text-gray-300 text-lg">

            Notre équipe étudie votre organisation afin de vous proposer
            une solution adaptée à vos besoins réguliers.

          </p>


          <a
            href="tel:0752988155"
            className="inline-block mt-8 bg-orange-500 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 transition"
          >
            📞 Contacter notre équipe
          </a>


        </div>


      </section>


<FAQ items={[
  {
    question: "Quelle fréquence de tournée proposez-vous ?",
    answer: "Quotidienne, hebdomadaire ou selon un planning personnalisé défini avec vous en fonction de votre activité."
  },
  {
    question: "Puis-je modifier ma tournée en cours de contrat ?",
    answer: "Oui, nos solutions sont flexibles et s'adaptent à l'évolution de vos besoins."
  },
  {
    question: "Y a-t-il un engagement minimum ?",
    answer: "Nous étudions chaque demande individuellement pour proposer une organisation adaptée, sans contrainte excessive."
  }
]} />



      {/* FOOTER */}

      <Footer />



    </main>

  );

}