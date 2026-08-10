"use client";

import { useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function Devis() {
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    const response = await fetch("/api/devis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      setSent(true);
      e.target.reset();
    } else {
      alert("Erreur lors de l’envoi.");
    }
  };

  return (
    <main className="bg-white text-gray-900 min-h-screen">

      <Navbar />

      {/* HERO */}

      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-black via-[#0B1F3A] to-black text-white">

        <div className="max-w-6xl mx-auto text-center">

          <p className="text-orange-400 font-bold uppercase tracking-widest text-sm">
            DEMANDE DE TRANSPORT
          </p>

          <h1 className="text-4xl md:text-5xl font-black mt-4 leading-tight">
            Obtenez votre solution de transport personnalisée
          </h1>

          <p className="mt-6 text-gray-300 text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
            Décrivez votre projet. Flashride Logistics vous accompagne avec
            une solution adaptée à votre activité, vos délais et votre volume.
          </p>

        </div>

      </section>

      {/* FORMULAIRE */}

      <section className="py-16 md:py-20 px-6 bg-gray-100">

        <div className="max-w-5xl mx-auto">

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl shadow-xl p-6 md:p-8 grid md:grid-cols-2 gap-5"
          >

            <select
              name="prestation"
              required
              className="border rounded-xl p-3.5 md:col-span-2 bg-white"
            >
              <option value="">Type de prestation</option>
              <option value="Tournée régulière">Tournée régulière</option>
              <option value="Transport express">Transport express</option>
              <option value="Transport dédié">Transport dédié</option>
              <option value="Transport de marchandises">
                Transport de marchandises
              </option>
              <option value="Logistique événementielle">
                Logistique événementielle
              </option>
              <option value="Sous-traitance transport">
                Sous-traitance transport
              </option>
            </select>

            <select
              name="client"
              required
              className="border rounded-xl p-3.5 bg-white"
            >
              <option value="">Vous êtes</option>
              <option value="Entreprise">Entreprise</option>
              <option value="Particulier">Particulier</option>
            </select>

            <select
              name="vehicule"
              required
              className="border rounded-xl p-3.5 bg-white"
            >
              <option value="">Type de véhicule souhaité</option>
              <option value="2 roues">2 roues</option>
              <option value="Véhicule léger jusqu'à 6m³">
                Véhicule léger jusqu'à 6m³
              </option>
              <option value="Fourgon 12/14m³">
                Fourgon 12/14m³
              </option>
              <option value="Grand volume 20m³ avec hayon">
                Grand volume 20m³ avec hayon
              </option>
              <option value="Besoin à définir">
                Besoin à définir
              </option>
            </select>

            <input
              name="nom"
              required
              className="border rounded-xl p-3.5"
              placeholder="Nom / Entreprise"
            />

            <input
              name="telephone"
              required
              type="tel"
              className="border rounded-xl p-3.5"
              placeholder="Téléphone"
            />

            <input
              name="email"
              required
              type="email"
              className="border rounded-xl p-3.5"
              placeholder="Email"
            />

            <div>

              <label className="block font-semibold mb-2">
                Date souhaitée du transport
              </label>

              <input
                name="date"
                required
                type="date"
                className="border rounded-xl p-3.5 w-full"
              />

            </div>

            <input
              name="volume"
              className="border rounded-xl p-3.5"
              placeholder="Volume (colis, palettes, dimensions)"
            />

            <input
              name="depart"
              required
              className="border rounded-xl p-3.5"
              placeholder="Ville de départ"
            />

            <input
              name="arrivee"
              required
              className="border rounded-xl p-3.5"
              placeholder="Ville d'arrivée"
            />

            <input
              name="marchandise"
              className="border rounded-xl p-3.5 md:col-span-2"
              placeholder="Type de marchandise"
            />

            <textarea
              name="message"
              className="border rounded-xl p-3.5 md:col-span-2"
              placeholder="Décrivez votre besoin (horaires, contraintes, informations complémentaires...)"
              rows={5}
            />

            <button
              type="submit"
              className="bg-orange-500 text-white font-bold text-base rounded-xl p-3.5 md:col-span-2 hover:bg-orange-600 transition"
            >
              Recevoir ma proposition
            </button>

          </form>

          {sent && (
            <div className="mt-5 bg-green-100 text-green-700 p-4 rounded-xl text-center font-semibold">
              ✅ Votre demande a bien été envoyée. Notre équipe vous
              recontactera sous 24h.
            </div>
          )}

        </div>

      </section>

      {/* INFORMATIONS */}

      <section className="py-16 px-6 bg-white">

        <div className="max-w-5xl mx-auto text-center">

          <p className="text-orange-500 font-bold uppercase tracking-widest text-sm">
            Besoin d'une réponse rapide ?
          </p>

          <h2 className="text-3xl md:text-4xl font-black mt-3">
            Notre équipe est à votre écoute
          </h2>

          <p className="mt-4 text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            Pour une demande urgente ou si vous préférez échanger directement
            avec notre équipe, vous pouvez également nous contacter par téléphone.
          </p>

          <a
            href="tel:0752988155"
            className="inline-block mt-7 bg-orange-500 text-white px-7 py-3.5 rounded-2xl font-bold hover:bg-orange-600 transition"
          >
            📞 07 52 98 81 55
          </a>

        </div>

      </section>

      <Footer />

    </main>
  );
}
