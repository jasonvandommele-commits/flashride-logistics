"use client";

import { useEffect, useRef, useState } from "react";

export default function CalculateurTransport() {
  const [form, setForm] = useState({
    depart: "",
    arrivee: "",

    urgent: false,
    express: false,
    attente: false,

    samedi: false,
    nuit: false,
    dimanche: false,
  });

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const [error, setError] =
    useState("");

  const [departSuggestions, setDepartSuggestions] =
    useState([]);

  const [arriveeSuggestions, setArriveeSuggestions] =
    useState([]);

  const [showDepartSuggestions, setShowDepartSuggestions] =
    useState(false);

  const [showArriveeSuggestions, setShowArriveeSuggestions] =
    useState(false);

  const departTimer =
    useRef(null);

  const arriveeTimer =
    useRef(null);

  /* =====================================================
     CHANGEMENT DES CHAMPS
  ===================================================== */

  function handleChange(e) {
    const {
      name,
      value,
      checked,
      type,
    } = e.target;

    setForm((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    if (name === "depart") {
      searchAddress(
        value,
        "depart"
      );
    }

    if (name === "arrivee") {
      searchAddress(
        value,
        "arrivee"
      );
    }
  }

  /* =====================================================
     AUTOCOMPLETE
  ===================================================== */

  function searchAddress(
    value,
    field
  ) {
    const text = value.trim();

    if (field === "depart") {
      clearTimeout(
        departTimer.current
      );

      if (text.length < 3) {
        setDepartSuggestions([]);
        setShowDepartSuggestions(false);
        return;
      }

      departTimer.current =
        setTimeout(async () => {
          try {
            const response =
              await fetch(
                `/api/autocomplete?text=${encodeURIComponent(
                  text
                )}`
              );

            const data =
              await response.json();

            if (
              data.success &&
              Array.isArray(
                data.suggestions
              )
            ) {
              setDepartSuggestions(
                data.suggestions
              );

              setShowDepartSuggestions(
                data.suggestions.length > 0
              );
            }
          } catch (error) {
            console.error(
              "Autocomplete départ:",
              error
            );
          }
        }, 350);
    }

    if (field === "arrivee") {
      clearTimeout(
        arriveeTimer.current
      );

      if (text.length < 3) {
        setArriveeSuggestions([]);
        setShowArriveeSuggestions(false);
        return;
      }

      arriveeTimer.current =
        setTimeout(async () => {
          try {
            const response =
              await fetch(
                `/api/autocomplete?text=${encodeURIComponent(
                  text
                )}`
              );

            const data =
              await response.json();

            if (
              data.success &&
              Array.isArray(
                data.suggestions
              )
            ) {
              setArriveeSuggestions(
                data.suggestions
              );

              setShowArriveeSuggestions(
                data.suggestions.length > 0
              );
            }
          } catch (error) {
            console.error(
              "Autocomplete arrivée:",
              error
            );
          }
        }, 350);
    }
  }

  /* =====================================================
     SÉLECTION D'UNE SUGGESTION
  ===================================================== */

  function selectDepart(
    suggestion
  ) {
    setForm((previous) => ({
      ...previous,

      depart:
        suggestion.formatted,
    }));

    setDepartSuggestions([]);
    setShowDepartSuggestions(false);
  }

  function selectArrivee(
    suggestion
  ) {
    setForm((previous) => ({
      ...previous,

      arrivee:
        suggestion.formatted,
    }));

    setArriveeSuggestions([]);
    setShowArriveeSuggestions(false);
  }

  /* =====================================================
     CALCUL
  ===================================================== */

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    setShowDepartSuggestions(false);
    setShowArriveeSuggestions(false);

    try {
      const response =
        await fetch(
          "/api/calculateur",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(form),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            data.error ||
            "Impossible de calculer le tarif."
        );
      }

      setResult(data);
    } catch (err) {
      setError(
        err.message ||
          "Une erreur est survenue. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     NETTOYAGE DES TIMERS
  ===================================================== */

  useEffect(() => {
    return () => {
      clearTimeout(
        departTimer.current
      );

      clearTimeout(
        arriveeTimer.current
      );
    };
  }, []);

  return (
    <section className="py-24 px-6 bg-gray-100">
      <div className="max-w-5xl mx-auto">

        {/* =================================================
            TITRE
        ================================================= */}

        <div className="text-center mb-12">

          <p className="text-orange-500 font-bold uppercase tracking-widest">
            Calculateur transport
          </p>

          <h2 className="text-3xl md:text-5xl font-black mt-4">
            Estimez votre transport en quelques secondes
          </h2>

          <p className="mt-5 text-gray-600 text-lg">
            Transport 20 m³ avec chauffeur.
            Obtenez une estimation instantanée
            selon votre trajet et vos options.
          </p>

        </div>

        {/* =================================================
            FORMULAIRE
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-xl p-8"
        >

          <div className="grid md:grid-cols-2 gap-6">

            {/* =============================================
                DÉPART
            ============================================= */}

            <div className="relative">

              <label className="block font-semibold mb-2">
                Ville ou adresse de départ
              </label>

              <input
                name="depart"
                value={form.depart}
                onChange={handleChange}
                onFocus={() => {
                  if (
                    departSuggestions.length > 0
                  ) {
                    setShowDepartSuggestions(
                      true
                    );
                  }
                }}
                onBlur={() => {
                  setTimeout(() => {
                    setShowDepartSuggestions(
                      false
                    );
                  }, 150);
                }}
                required
                autoComplete="off"
                placeholder="Ex. 3 rue Delaporte, Maisons-Alfort"
                className="w-full border border-gray-200 rounded-xl p-4 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />

              {showDepartSuggestions &&
                departSuggestions.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">

                    {departSuggestions.map(
                      (
                        suggestion,
                        index
                      ) => (
                        <button
                          type="button"
                          key={`${suggestion.formatted}-${index}`}
                          onMouseDown={() =>
                            selectDepart(
                              suggestion
                            )
                          }
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 transition"
                        >
                          <p className="font-semibold text-gray-800">
                            {suggestion.addressLine1 ||
                              suggestion.formatted}
                          </p>

                          <p className="text-sm text-gray-500 mt-1">
                            {suggestion.addressLine2 ||
                              suggestion.formatted}
                          </p>
                        </button>
                      )
                    )}

                  </div>
                )}

            </div>

            {/* =============================================
                ARRIVÉE
            ============================================= */}

            <div className="relative">

              <label className="block font-semibold mb-2">
                Ville ou adresse d'arrivée
              </label>

              <input
                name="arrivee"
                value={form.arrivee}
                onChange={handleChange}
                onFocus={() => {
                  if (
                    arriveeSuggestions.length > 0
                  ) {
                    setShowArriveeSuggestions(
                      true
                    );
                  }
                }}
                onBlur={() => {
                  setTimeout(() => {
                    setShowArriveeSuggestions(
                      false
                    );
                  }, 150);
                }}
                required
                autoComplete="off"
                placeholder="Ex. Versailles"
                className="w-full border border-gray-200 rounded-xl p-4 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />

              {showArriveeSuggestions &&
                arriveeSuggestions.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">

                    {arriveeSuggestions.map(
                      (
                        suggestion,
                        index
                      ) => (
                        <button
                          type="button"
                          key={`${suggestion.formatted}-${index}`}
                          onMouseDown={() =>
                            selectArrivee(
                              suggestion
                            )
                          }
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 transition"
                        >
                          <p className="font-semibold text-gray-800">
                            {suggestion.addressLine1 ||
                              suggestion.formatted}
                          </p>

                          <p className="text-sm text-gray-500 mt-1">
                            {suggestion.addressLine2 ||
                              suggestion.formatted}
                          </p>
                        </button>
                      )
                    )}

                  </div>
                )}

            </div>

          </div>

          {/* =================================================
              OPTIONS
          ================================================= */}

          <div className="mt-8">

            <p className="font-bold text-lg mb-4">
              Options
            </p>

            <div className="grid sm:grid-cols-2 gap-4">

              {/* URGENT */}

              <label className="flex items-center gap-3 border rounded-xl p-4 cursor-pointer hover:border-orange-300 transition">

                <input
                  type="checkbox"
                  name="urgent"
                  checked={form.urgent}
                  onChange={handleChange}
                  className="w-5 h-5 accent-orange-500"
                />

                <span>
                  <strong>
                    Urgent
                  </strong>

                  <br />

                  <span className="text-gray-500 text-sm">
                    +20 € HT
                  </span>
                </span>

              </label>

              {/* EXPRESS */}

              <label className="flex items-center gap-3 border rounded-xl p-4 cursor-pointer hover:border-orange-300 transition">

                <input
                  type="checkbox"
                  name="express"
                  checked={form.express}
                  onChange={handleChange}
                  className="w-5 h-5 accent-orange-500"
                />

                <span>
                  <strong>
                    Express / prioritaire
                  </strong>

                  <br />

                  <span className="text-gray-500 text-sm">
                    +40 € HT
                  </span>
                </span>

              </label>

              {/* ATTENTE */}

              <label className="flex items-center gap-3 border rounded-xl p-4 cursor-pointer hover:border-orange-300 transition">

                <input
                  type="checkbox"
                  name="attente"
                  checked={form.attente}
                  onChange={handleChange}
                  className="w-5 h-5 accent-orange-500"
                />

                <span>
                  <strong>
                    Attente 30 min
                  </strong>

                  <br />

                  <span className="text-gray-500 text-sm">
                    +30 € HT
                  </span>
                </span>

              </label>

              {/* SAMEDI */}

              <label className="flex items-center gap-3 border rounded-xl p-4 cursor-pointer hover:border-orange-300 transition">

                <input
                  type="checkbox"
                  name="samedi"
                  checked={form.samedi}
                  onChange={handleChange}
                  className="w-5 h-5 accent-orange-500"
                />

                <span>
                  <strong>
                    Samedi
                  </strong>

                  <br />

                  <span className="text-gray-500 text-sm">
                    +10 %
                  </span>
                </span>

              </label>

              {/* NUIT */}

              <label className="flex items-center gap-3 border rounded-xl p-4 cursor-pointer hover:border-orange-300 transition">

                <input
                  type="checkbox"
                  name="nuit"
                  checked={form.nuit}
                  onChange={handleChange}
                  className="w-5 h-5 accent-orange-500"
                />

                <span>
                  <strong>
                    Nuit 22h–6h
                  </strong>

                  <br />

                  <span className="text-gray-500 text-sm">
                    +25 %
                  </span>
                </span>

              </label>

              {/* DIMANCHE */}

              <label className="flex items-center gap-3 border rounded-xl p-4 cursor-pointer hover:border-orange-300 transition">

                <input
                  type="checkbox"
                  name="dimanche"
                  checked={form.dimanche}
                  onChange={handleChange}
                  className="w-5 h-5 accent-orange-500"
                />

                <span>
                  <strong>
                    Dimanche / jour férié
                  </strong>

                  <br />

                  <span className="text-gray-500 text-sm">
                    +30 %
                  </span>
                </span>

              </label>

            </div>

          </div>

          {/* =================================================
              BOUTON
          ================================================= */}

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full bg-orange-500 text-white font-bold text-lg rounded-xl p-4 hover:bg-orange-600 transition disabled:opacity-60"
          >
            {loading
              ? "Calcul en cours..."
              : "Calculer mon estimation"}
          </button>

        </form>

        {/* =================================================
            ERREUR
        ================================================= */}

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-5 text-center">
            {error}
          </div>
        )}

        {/* =================================================
            RÉSULTAT
        ================================================= */}

        {result && (
          <div className="mt-8 bg-white rounded-3xl shadow-xl p-8">

            <div className="text-center">

              <p className="text-gray-500 font-semibold">
                Estimation de votre transport
              </p>

              <p className="text-5xl font-black mt-3">
                {result.tarif.totalHT} €

                <span className="text-xl ml-2">
                  HT
                </span>
              </p>

              <p className="text-gray-500 mt-2">
                Transport 20 m³ avec chauffeur
              </p>

            </div>

            {/* =================================================
                TRAJET
            ================================================= */}

            <div className="mt-8 grid md:grid-cols-3 gap-4">

              <div className="bg-gray-100 rounded-2xl p-5 text-center">

                <p className="text-gray-500 text-sm">
                  Départ
                </p>

                <p className="font-bold mt-1">
                  {result.depart.zone}
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  {result.depart.codePostal ||
                    result.depart.ville}
                </p>

              </div>

              <div className="bg-gray-100 rounded-2xl p-5 text-center">

                <p className="text-gray-500 text-sm">
                  Distance
                </p>

                <p className="font-bold text-xl mt-1">
                  {result.trajet.distanceKm} km
                </p>

                {result.trajet.dureeMinutes && (
                  <p className="text-sm text-gray-500 mt-1">
                    Environ{" "}
                    {result.trajet.dureeMinutes} min
                  </p>
                )}

              </div>

              <div className="bg-gray-100 rounded-2xl p-5 text-center">

                <p className="text-gray-500 text-sm">
                  Arrivée
                </p>

                <p className="font-bold mt-1">
                  {result.arrivee.zone}
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  {result.arrivee.codePostal ||
                    result.arrivee.ville}
                </p>

              </div>

            </div>

            {/* =================================================
                DÉTAIL PRIX
            ================================================= */}

            <div className="mt-8 border-t pt-6">

              <div className="flex justify-between py-2">

                <span>
                  Tarif de base
                </span>

                <strong>
                  {result.tarif.baseHT} € HT
                </strong>

              </div>

              {result.tarif.supplementDistanceHT >
                0 && (
                <div className="flex justify-between py-2">

                  <span>
                    Ajustement distance
                  </span>

                  <strong>
                    +
                    {
                      result.tarif
                        .supplementDistanceHT
                    }{" "}
                    €
                  </strong>

                </div>
              )}

              {result.supplements.map(
                (
                  supplement,
                  index
                ) => (
                  <div
                    key={index}
                    className="flex justify-between py-2"
                  >

                    <span>
                      {supplement.label}
                    </span>

                    <strong>
                      {supplement.amount !==
                      null
                        ? `+${supplement.amount} €`
                        : "Appliqué"}
                    </strong>

                  </div>
                )
              )}

            </div>

            {/* =================================================
                SUPPLÉMENTS
            ================================================= */}

            <div className="mt-6 bg-orange-50 rounded-2xl p-5">

              <p className="font-bold">
                À prévoir en supplément
              </p>

              <p className="text-gray-600 text-sm mt-2">
                Péages facturés en supplément.
                Manutention sur devis.
              </p>

            </div>

            {/* =================================================
                MENTION
            ================================================= */}

            <div className="mt-6 text-center">

              <p className="text-xs text-gray-500 leading-relaxed">
                Tarif indicatif calculé
                automatiquement. Le montant
                définitif peut être ajusté selon
                les conditions réelles de la mission,
                notamment l'accès, le stationnement,
                la manutention ou les contraintes
                particulières.
              </p>

            </div>

            {/* =================================================
                CTA
            ================================================= */}

            <a
              href="#devis"
              className="mt-6 block w-full text-center bg-orange-500 text-white font-bold rounded-xl p-4 hover:bg-orange-600 transition"
            >
              Confirmer ma demande de devis
            </a>

          </div>
        )}

      </div>
    </section>
  );
}