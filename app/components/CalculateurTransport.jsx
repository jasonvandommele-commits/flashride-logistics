"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

const INITIAL_FORM = {
  depart: "",
  arrivee: "",
  vehicule: "20m3",
  priorite: "standard",
  nuit: false,
  samedi: false,
  dimanche: false,
};

/* =========================================================
   VÉHICULES
========================================================= */

const VEHICLES = [
  {
    id: "moto",
    emoji: "🏍️",
    name: "Moto",
    description: "Transport léger et rapide",
  },
  {
    id: "voiture",
    emoji: "🚗",
    name: "Voiture 3 m³",
    description: "Petit volume",
  },
  {
    id: "fourgon",
    emoji: "🚐",
    name: "Fourgon 8 m³",
    description: "Volume intermédiaire",
  },
  {
    id: "20m3",
    emoji: "🚚",
    name: "Utilitaire 20 m³",
    description: "Avec hayon",
  },
];

/* =========================================================
   ADDRESS INPUT
========================================================= */

function AddressInput({
  name,
  label,
  placeholder,
  value,
  onChange,
  onSelect,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] =
    useState(false);
  const [showSuggestions, setShowSuggestions] =
    useState(false);

  const wrapperRef = useRef(null);
  const abortRef = useRef(null);
  const requestIdRef = useRef(0);
  const justSelectedRef = useRef(false);

  useEffect(() => {
    const text = String(value || "").trim();

    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }

    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }

    if (text.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      setLoadingSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      const controller = new AbortController();

      abortRef.current = controller;

      const requestId = ++requestIdRef.current;

      setLoadingSuggestions(true);

      try {
        const response = await fetch(
          `/api/autocomplete?text=${encodeURIComponent(text)}`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            "Erreur lors de la recherche d'adresse."
          );
        }

        const data = await response.json();

        if (requestId !== requestIdRef.current) {
          return;
        }

        const results = Array.isArray(data.suggestions)
          ? data.suggestions
          : [];

        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (error) {
        if (error?.name === "AbortError") {
          return;
        }

        console.error(
          "Erreur autocomplétion :",
          error
        );

        if (requestId === requestIdRef.current) {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setLoadingSuggestions(false);
        }
      }
    }, 220);

    return () => {
      clearTimeout(timer);
    };
  }, [value]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  function handleSelect(suggestion) {
    const formatted =
      suggestion.formatted ||
      [
        suggestion.housenumber,
        suggestion.street,
        suggestion.postcode,
        suggestion.city,
      ]
        .filter(Boolean)
        .join(" ");

    if (!formatted) {
      return;
    }

    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }

    requestIdRef.current += 1;

    justSelectedRef.current = true;

    setShowSuggestions(false);
    setSuggestions([]);
    setLoadingSuggestions(false);

    onSelect(name, formatted, suggestion);
  }

  function handleInputChange(event) {
    justSelectedRef.current = false;
    onChange(event);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block font-semibold text-sm md:text-base mb-2">
        {label}
      </label>

      <div className="relative">
        <input
          type="text"
          name={name}
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          required
          autoComplete="off"
          placeholder={placeholder}
          className="w-full border border-gray-200 rounded-xl p-3 md:p-4 pr-12 text-sm md:text-base outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition"
        />

        {loadingSuggestions && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {showSuggestions &&
        suggestions.length > 0 && (
          <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
            {suggestions.map(
              (suggestion, index) => {
                const addressLine1 =
                  suggestion.addressLine1 ||
                  [
                    suggestion.housenumber,
                    suggestion.street,
                  ]
                    .filter(Boolean)
                    .join(" ") ||
                  suggestion.formatted;

                const addressLine2 =
                  suggestion.addressLine2 ||
                  [
                    suggestion.postcode,
                    suggestion.city,
                  ]
                    .filter(Boolean)
                    .join(" ");

                return (
                  <button
                    key={
                      suggestion.placeId ||
                      `${suggestion.formatted}-${index}`
                    }
                    type="button"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      handleSelect(suggestion);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-orange-50 transition border-b last:border-b-0 border-gray-100"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-orange-500">
                        📍
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">
                          {addressLine1}
                        </p>

                        {addressLine2 && (
                          <p className="text-sm text-gray-500 mt-1">
                            {addressLine2}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              }
            )}
          </div>
        )}
    </div>
  );
}

/* =========================================================
   CALCULATEUR TRANSPORT
========================================================= */

export default function CalculateurTransport() {
  const [form, setForm] =
    useState(INITIAL_FORM);

  const [
    selectedAddresses,
    setSelectedAddresses,
  ] = useState({
    depart: null,
    arrivee: null,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  function handleChange(event) {
    const {
      name,
      value,
      checked,
      type,
    } = event.target;

    setForm((previous) => {
      const next = {
        ...previous,
        [name]:
          type === "checkbox"
            ? checked
            : value,
      };

      if (
        name === "samedi" &&
        checked
      ) {
        next.dimanche = false;
      }

      if (
        name === "dimanche" &&
        checked
      ) {
        next.samedi = false;
      }

      return next;
    });

    if (
      name === "depart" ||
      name === "arrivee"
    ) {
      setSelectedAddresses(
        (previous) => ({
          ...previous,
          [name]: null,
        })
      );

      setResult(null);
      setError("");
    }
  }

  function handleAddressSelect(
    name,
    value,
    suggestion
  ) {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSelectedAddresses(
      (previous) => ({
        ...previous,
        [name]: suggestion
          ? {
              latitude:
                suggestion.latitude ?? null,
              longitude:
                suggestion.longitude ?? null,
              postcode:
                suggestion.postcode || "",
              city:
                suggestion.city || "",
              formatted:
                suggestion.formatted || value,
              housenumber:
                suggestion.housenumber || "",
              street:
                suggestion.street || "",
            }
          : null,
      })
    );

    setResult(null);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const body = {
        ...form,
        departGeo:
          selectedAddresses.depart,
        arriveeGeo:
          selectedAddresses.arrivee,
      };

      const response = await fetch(
        "/api/calculateur",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Impossible de calculer le tarif."
        );
      }

      if (
        data.reason ===
        "hors_zone"
      ) {
        setResult(data);

        requestAnimationFrame(() => {
          setTimeout(() => {
            document
              .getElementById(
                "resultat-calculateur"
              )
              ?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
          }, 50);
        });

        return;
      }

      if (!data.success) {
        throw new Error(
          data.message ||
            data.error ||
            "Impossible de calculer le tarif."
        );
      }

      setResult(data);

      requestAnimationFrame(() => {
        setTimeout(() => {
          document
            .getElementById(
              "resultat-calculateur"
            )
            ?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
        }, 50);
      });
    } catch (err) {
      setError(
        err?.message ||
          "Une erreur est survenue. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-12 md:py-24 px-4 md:px-6 bg-gray-100">
      <div className="max-w-5xl mx-auto">

        {/* =================================================
            TITRE
        ================================================= */}

        <div className="text-center mb-7 md:mb-12">
          <p className="text-orange-500 font-bold uppercase tracking-widest text-xs md:text-sm">
            Calculateur transport
          </p>

          <h2 className="text-2xl md:text-5xl font-black mt-3 md:mt-4 leading-tight">
            Estimez votre transport en quelques secondes
          </h2>

          <p className="mt-3 md:mt-5 text-gray-600 text-sm md:text-lg max-w-2xl mx-auto">
            Obtenez une estimation instantanée
            selon votre trajet, votre véhicule
            et vos options.
          </p>
        </div>

        {/* =================================================
            FORMULAIRE
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-8"
        >

          {/* =================================================
              ADRESSES
          ================================================= */}

          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            <AddressInput
              name="depart"
              label="Ville ou adresse de départ"
              placeholder="Ex. 3 rue Delaporte, Maisons-Alfort"
              value={form.depart}
              onChange={handleChange}
              onSelect={handleAddressSelect}
            />

            <AddressInput
              name="arrivee"
              label="Ville ou adresse d'arrivée"
              placeholder="Ex. 10 avenue de Paris, Versailles"
              value={form.arrivee}
              onChange={handleChange}
              onSelect={handleAddressSelect}
            />
          </div>

          {/* =================================================
              VÉHICULE
          ================================================= */}

          <div className="mt-6 md:mt-8">
            <p className="font-bold text-base md:text-lg mb-3 md:mb-4">
              Choisissez votre véhicule
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-4">
              {VEHICLES.map(
                (vehicle) => (
                  <label
                    key={vehicle.id}
                    className={`border rounded-xl p-3 md:p-4 cursor-pointer transition ${
                      form.vehicule ===
                      vehicle.id
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="vehicule"
                      value={vehicle.id}
                      checked={
                        form.vehicule ===
                        vehicle.id
                      }
                      onChange={handleChange}
                      className="sr-only"
                    />

                    <div className="text-2xl md:text-3xl mb-1 md:mb-2">
                      {vehicle.emoji}
                    </div>

                    <strong className="block text-sm md:text-base leading-tight">
                      {vehicle.name}
                    </strong>

                    <p className="text-gray-500 text-xs md:text-sm mt-1 leading-tight">
                      {vehicle.description}
                    </p>
                  </label>
                )
              )}
            </div>
          </div>

          {/* =================================================
              PRIORITÉ
          ================================================= */}

          <div className="mt-6 md:mt-8">
            <p className="font-bold text-base md:text-lg mb-3 md:mb-4">
              Priorité du transport
            </p>

            <div className="grid sm:grid-cols-3 gap-2.5 md:gap-4">

              <label
                className={`border rounded-xl p-3 md:p-4 cursor-pointer transition ${
                  form.priorite ===
                  "standard"
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-orange-300"
                }`}
              >
                <input
                  type="radio"
                  name="priorite"
                  value="standard"
                  checked={
                    form.priorite ===
                    "standard"
                  }
                  onChange={handleChange}
                  className="mr-2 accent-orange-500"
                />

                <strong className="text-sm md:text-base">
                  Standard — Transport planifié
                </strong>

                <p className="text-gray-500 text-xs md:text-sm mt-1">
                  Tarif normal
                </p>
              </label>

              <label
                className={`border rounded-xl p-3 md:p-4 cursor-pointer transition ${
                  form.priorite ===
                  "urgent"
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-orange-300"
                }`}
              >
                <input
                  type="radio"
                  name="priorite"
                  value="urgent"
                  checked={
                    form.priorite ===
                    "urgent"
                  }
                  onChange={handleChange}
                  className="mr-2 accent-orange-500"
                />

                <strong className="text-sm md:text-base">
                  Urgence — Départ prioritaire
                </strong>

                <p className="text-gray-500 text-xs md:text-sm mt-1">
                  + selon le véhicule
                </p>
              </label>

              <label
                className={`border rounded-xl p-3 md:p-4 cursor-pointer transition ${
                  form.priorite ===
                  "express"
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-orange-300"
                }`}
              >
                <input
                  type="radio"
                  name="priorite"
                  value="express"
                  checked={
                    form.priorite ===
                    "express"
                  }
                  onChange={handleChange}
                  className="mr-2 accent-orange-500"
                />

                <strong className="text-sm md:text-base">
                  Course dédiée
                </strong>

                <p className="text-gray-500 text-xs md:text-sm mt-1">
                  + selon le véhicule
                </p>

                <p className="text-gray-500 text-[11px] md:text-xs mt-1 leading-tight">
                  Véhicule exclusivement dédié à votre mission
                </p>
              </label>

            </div>
          </div>

          {/* =================================================
              CONDITIONS
          ================================================= */}

          <div className="mt-6 md:mt-8">
            <p className="font-bold text-base md:text-lg mb-3 md:mb-4">
              Conditions de transport
            </p>

            <div className="grid sm:grid-cols-3 gap-2.5 md:gap-4">

              {/* NUIT */}

              <label
                className={`flex items-center gap-2.5 md:gap-3 border rounded-xl p-3 md:p-4 cursor-pointer transition ${
                  form.nuit
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-orange-300"
                }`}
              >
                <input
                  type="checkbox"
                  name="nuit"
                  checked={form.nuit}
                  onChange={handleChange}
                  className="w-4 h-4 md:w-5 md:h-5 accent-orange-500 shrink-0"
                />

                <span>
                  <strong className="text-sm md:text-base">
                    Nuit 22h–6h
                  </strong>

                  <br />

                  <span className="text-gray-500 text-xs md:text-sm">
                    +20 % à +25 % selon véhicule
                  </span>
                </span>
              </label>

              {/* SAMEDI */}

              <label
                className={`flex items-center gap-2.5 md:gap-3 border rounded-xl p-3 md:p-4 cursor-pointer transition ${
                  form.samedi
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-orange-300"
                }`}
              >
                <input
                  type="checkbox"
                  name="samedi"
                  checked={form.samedi}
                  onChange={handleChange}
                  className="w-4 h-4 md:w-5 md:h-5 accent-orange-500 shrink-0"
                />

                <span>
                  <strong className="text-sm md:text-base">
                    Samedi
                  </strong>

                  <br />

                  <span className="text-gray-500 text-xs md:text-sm">
                    +10 %
                  </span>
                </span>
              </label>

              {/* DIMANCHE / FÉRIÉ */}

              <label
                className={`flex items-center gap-2.5 md:gap-3 border rounded-xl p-3 md:p-4 cursor-pointer transition ${
                  form.dimanche
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-orange-300"
                }`}
              >
                <input
                  type="checkbox"
                  name="dimanche"
                  checked={form.dimanche}
                  onChange={handleChange}
                  className="w-4 h-4 md:w-5 md:h-5 accent-orange-500 shrink-0"
                />

                <span>
                  <strong className="text-sm md:text-base">
                    Dimanche / jour férié
                  </strong>

                  <br />

                  <span className="text-gray-500 text-xs md:text-sm">
                    +25 % à +30 % selon véhicule
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
            className="mt-6 md:mt-8 w-full bg-orange-500 text-white font-bold text-base md:text-lg rounded-xl p-3.5 md:p-4 hover:bg-orange-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
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
          <div className="mt-4 md:mt-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 md:p-5 text-center text-sm md:text-base">
            {error}
          </div>
        )}

        {/* =================================================
            RÉSULTAT
        ================================================= */}

        {result && (
          <div
            id="resultat-calculateur"
            className="mt-5 md:mt-8 bg-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-8 scroll-mt-8"
          >

            {/* =================================================
                HORS IDF
            ================================================= */}

            {!result.success &&
              result.reason ===
                "hors_zone" && (
                <div className="text-center">

                  <div className="text-3xl md:text-4xl mb-3 md:mb-4">
                    📍
                  </div>

                  <h3 className="text-xl md:text-2xl font-black">
                    Trajet sur devis
                  </h3>

                  <p className="text-gray-600 text-sm md:text-base mt-2 md:mt-3">
                    Ce trajet sort de notre
                    zone tarifaire automatique.
                  </p>

                  <p className="text-gray-600 text-sm md:text-base mt-2">
                    Contactez-nous pour obtenir
                    un devis personnalisé.
                  </p>

                  <a
                    href="#devis"
                    className="mt-5 md:mt-6 block w-full text-center bg-orange-500 text-white font-bold rounded-xl p-3.5 md:p-4 hover:bg-orange-600 transition"
                  >
                    Demander un devis
                  </a>

                </div>
              )}

            {/* =================================================
                RÉSULTAT IDF
            ================================================= */}

            {result.success && (
              <>
                <div className="text-center">

                  <p className="text-gray-500 font-semibold text-sm md:text-base">
                    Estimation de votre transport
                  </p>

                  <p className="text-3xl md:text-5xl font-black mt-2 md:mt-3">
                    À partir de{" "}
                    {result.tarif.totalHT}{" "}
                    <span className="text-base md:text-xl ml-1 md:ml-2">
                      € HT
                    </span>
                  </p>

                  <p className="text-gray-500 text-sm md:text-base mt-2">
                    {result.vehicle}
                  </p>

                  {result.vehicle ===
                    "Utilitaire 20 m³" && (
                    <p className="text-gray-500 text-xs md:text-sm mt-1">
                      Avec hayon
                    </p>
                  )}

                </div>

                {/* =================================================
                    TRAJET
                ================================================= */}

                <div className="mt-5 md:mt-8 grid md:grid-cols-3 gap-2.5 md:gap-4">

                  <div className="bg-gray-100 rounded-2xl p-3.5 md:p-5 text-center">
                    <p className="text-gray-500 text-xs md:text-sm">
                      Départ
                    </p>

                    <p className="font-bold text-sm md:text-base mt-1">
                      {result.depart.zone}
                    </p>

                    <p className="text-xs md:text-sm text-gray-500 mt-1">
                      {result.depart.codePostal ||
                        result.depart.ville}
                    </p>
                  </div>

                  <div className="bg-gray-100 rounded-2xl p-3.5 md:p-5 text-center">
                    <p className="text-gray-500 text-xs md:text-sm">
                      Distance
                    </p>

                    <p className="font-bold text-lg md:text-xl mt-1">
                      {
                        result.trajet
                          .distanceKm
                      }{" "}
                      km
                    </p>
                  </div>

                  <div className="bg-gray-100 rounded-2xl p-3.5 md:p-5 text-center">
                    <p className="text-gray-500 text-xs md:text-sm">
                      Arrivée
                    </p>

                    <p className="font-bold text-sm md:text-base mt-1">
                      {result.arrivee.zone}
                    </p>

                    <p className="text-xs md:text-sm text-gray-500 mt-1">
                      {result.arrivee.codePostal ||
                        result.arrivee.ville}
                    </p>
                  </div>

                </div>

                {/* =================================================
                    DÉTAIL PRIX
                ================================================= */}

                <div className="mt-5 md:mt-8 border-t pt-5 md:pt-6 text-sm md:text-base">

                  <div className="flex justify-between py-1.5 md:py-2 gap-4">
                    <span>
                      Tarif de base
                    </span>

                    <strong className="whitespace-nowrap">
                      {result.tarif.baseHT} €
                      HT
                    </strong>
                  </div>

                  {result.tarif
                    .supplementDistanceHT >
                    0 && (
                    <div className="flex justify-between py-1.5 md:py-2 gap-4">
                      <span>
                        Ajustement distance
                      </span>

                      <strong className="whitespace-nowrap">
                        +
                        {
                          result.tarif
                            .supplementDistanceHT
                        }{" "}
                        € HT
                      </strong>
                    </div>
                  )}

                  {result.supplements?.map(
                    (
                      supplement,
                      index
                    ) => (
                      <div
                        key={index}
                        className="flex justify-between py-1.5 md:py-2 gap-4"
                      >
                        <span>
                          {
                            supplement.label
                          }
                        </span>

                        <strong className="whitespace-nowrap">
                          {supplement.amount !==
                          null
                            ? `+${supplement.amount} € HT`
                            : "Appliqué"}
                        </strong>
                      </div>
                    )
                  )}

                </div>

                {/* =================================================
                    À SAVOIR
                ================================================= */}

                <div className="mt-4 md:mt-6 bg-orange-50 rounded-2xl p-4 md:p-5">

                  <p className="font-bold text-sm md:text-base">
                    À savoir
                  </p>

                  <p className="text-gray-600 text-xs md:text-sm mt-2">
                    30 min d'attente sont incluses.
                    Au-delà, l'attente supplémentaire
                    est facturée selon le véhicule.
                    Manutention sur devis.
                  </p>

                </div>

                {/* =================================================
                    DISCLAIMER
                ================================================= */}

                <div className="mt-4 md:mt-6 text-center">

                  <p className="text-[10px] md:text-xs text-gray-500 leading-relaxed">
                    Tarif indicatif calculé
                    automatiquement. Le montant
                    définitif peut être ajusté selon
                    les conditions réelles de la
                    mission, notamment le
                    stationnement, la manutention
                    ou les contraintes particulières.
                  </p>

                </div>

                {/* =================================================
                    DEVIS
                ================================================= */}

                <a
                  href="#devis"
                  className="mt-5 md:mt-6 block w-full text-center bg-orange-500 text-white font-bold rounded-xl p-3.5 md:p-4 hover:bg-orange-600 transition"
                >
                  Confirmer ma demande de devis
                </a>

              </>
            )}

          </div>
        )}

      </div>
    </section>
  );
}