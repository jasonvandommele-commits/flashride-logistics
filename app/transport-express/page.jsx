"use client";

import { useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import FAQ from "../components/FAQ";


export default function TransportExpress() {

  
  return (

    <main className="bg-white text-gray-900 min-h-screen">


      {/* NAVIGATION */}

      <Navbar />


      {/* BANNIÈRE HERO */}

<section
  className="relative pt-24 min-h-[650px] flex items-center bg-cover bg-center"
  style={{
    backgroundImage:
      "url('/images/IMG_0255.jpeg')",
  }}
>

  <div className="absolute inset-0 bg-[#0B1F3A]/85"></div>


  <div className="relative max-w-7xl mx-auto px-6 py-20 text-white">


    <p className="text-orange-400 font-bold uppercase tracking-[0.2em] mb-5">
      TRANSPORT EXPRESS
    </p>


    <h1 className="text-4xl md:text-6xl font-black leading-tight max-w-4xl">

      Transport express :
      <span className="text-orange-500">
        {" "}quand chaque minute compte.
      </span>

    </h1>



    <p className="mt-8 text-gray-200 text-lg md:text-xl leading-relaxed max-w-3xl">

      Un imprévu peut arriver à tout moment : une pièce urgente,
      une marchandise à déplacer rapidement ou une livraison qui
      ne peut pas attendre. Flashride Logistics met en place une
      solution express pour vous permettre de respecter vos engagements.

    </p>



    <div className="mt-10 flex flex-wrap gap-4">


      <a
        href="tel:0752988155"
        className="bg-orange-500 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 transition"
      >
        📞 Appeler pour une urgence
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

      {/* BESOIN */}

      <section className="py-20 px-6 bg-gray-100">


        <div className="max-w-6xl mx-auto">


          <div className="text-center mb-12">


            <p className="text-orange-500 font-bold uppercase tracking-widest">
              Transport express
            </p>


            <h2 className="text-3xl md:text-5xl font-black mt-4">
              Dans quels cas faire appel à nous ?
            </h2>


          </div>



          <div className="grid md:grid-cols-2 gap-6">


            {[
              "Une pièce urgente doit arriver rapidement",
              "Votre activité est bloquée par un imprévu",
              "Votre client attend une livraison prioritaire",
              "Vous avez besoin d’un transport ponctuel"
            ].map((item,index)=>(


              <div
                key={index}
                className="bg-white rounded-3xl p-8 shadow-sm"
              >

                <p className="text-lg font-bold">
                  ✓ {item}
                </p>


              </div>


            ))}


          </div>


        </div>


      </section>




      {/* EXPLICATION */}

      <section className="py-20 px-6 bg-white">


        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">


          <div>


            <p className="text-orange-500 font-bold uppercase tracking-widest">
              Notre mission
            </p>


            <h2 className="text-3xl md:text-5xl font-black mt-4">
              Un transport rapide, organisé et sécurisé.
            </h2>


            <p className="mt-6 text-gray-600 text-lg leading-relaxed">

              Le transport express permet d’acheminer une marchandise
              avec un délai réduit lorsque le transport classique n’est
              pas suffisant.

            </p>


            <p className="mt-5 text-gray-600 text-lg leading-relaxed">

              Nous adaptons la solution selon votre volume,
              votre destination et votre contrainte de délai.

            </p>


          </div>



          <div className="bg-[#0B1F3A] text-white rounded-3xl p-10">


            <h3 className="text-2xl font-bold">
              Nos engagements
            </h3>


            <ul className="mt-6 space-y-4 text-gray-200">

              <li>✓ Réactivité</li>
              <li>✓ Ponctualité</li>
              <li>✓ Transport sécurisé</li>
              <li>✓ Suivi personnalisé</li>

            </ul>


          </div>


        </div>


      </section>




      {/* FONCTIONNEMENT */}

      <section className="py-20 px-6 bg-gray-100">


        <div className="max-w-6xl mx-auto">


          <h2 className="text-center text-3xl md:text-5xl font-black mb-12">
            Comment ça fonctionne ?
          </h2>



          <div className="grid md:grid-cols-3 gap-8">


            {[
              ["01","Contact","Vous nous expliquez votre besoin urgent."],
              ["02","Organisation","Nous trouvons la solution adaptée."],
              ["03","Livraison","Votre marchandise est acheminée."]
            ].map((step,index)=>(


              <div
                key={index}
                className="bg-white rounded-3xl p-8 text-center"
              >

                <p className="text-orange-500 text-4xl font-black">
                  {step[0]}
                </p>

                <h3 className="text-xl font-bold mt-4">
                  {step[1]}
                </h3>

                <p className="text-gray-600 mt-3">
                  {step[2]}
                </p>


              </div>


            ))}


          </div>


        </div>


      </section>




      {/* CTA */}

      <section className="py-20 px-6 bg-[#0B1F3A] text-white text-center">


        <h2 className="text-3xl md:text-5xl font-black">
  Besoin d’une solution de transport rapidement ?
</h2>


<p className="mt-5 text-gray-300 text-lg">
  Notre équipe est à votre écoute pour comprendre votre besoin
  et vous proposer une solution adaptée à votre situation.
</p>


<a
  href="tel:0752988155"
  className="inline-block mt-8 bg-orange-500 px-8 py-4 rounded-2xl font-bold text-lg"
>
  📞 Contacter notre équipe
</a>


      </section>

<FAQ items={[
  {
    question: "Sous quel délai pouvez-vous intervenir ?",
    answer: "Selon votre localisation en Île-de-France, nous pouvons généralement intervenir sous 1 à 2 heures après confirmation de la demande."
  },
  {
    question: "Le transport express est-il disponible le week-end ?",
    answer: "Contactez-nous directement par téléphone pour vérifier nos disponibilités selon les jours et horaires."
  },
  {
    question: "Quels types de colis ou marchandises acceptez-vous ?",
    answer: "Documents, plis, petits colis jusqu'aux volumes plus importants selon le véhicule mobilisé. Précisez votre besoin lors de la demande de devis."
  }
]} />



            {/* FOOTER */}

      <Footer />



    </main>
  );
}