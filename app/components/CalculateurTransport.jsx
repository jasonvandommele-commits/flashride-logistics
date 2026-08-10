"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

const INITIAL_FORM = {
  depart: "",
  arrivee: "",

  vehicle: "20m3",

  priorite: "standard",

  samedi: false,
  nuit: false,
  dimanche: false,
};

/* =========================================================
   VÉHICULES
========================================================= */

const VEHICLES = [
  {
    id: "moto",
    icon: "🏍️",
    name: "Moto",
    volume: null,
    description:
      "Petits plis, documents et colis",
  },

  {
    id: "voiture",
    icon: "🚗",
    name: "Voiture",
    volume: "3 m³",
    description:
      "Colis et petits transports",
  },

  {
    id: "fourgon",
    icon: "🚐",
    name: "Fourgon",
    volume: "8 m³",
    description:
      "Marchandises et volumes intermédiaires",
  },

  {
    id: "20m3",
    icon: "🚚",
    name: "20 m³",
    volume: "20 m³",
    description:
      "Volumes importants et déménagements",
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
  const [suggestions, setSuggestions] =
    useState([]);

  const [
    loadingSuggestions,
    setLoadingSuggestions,
  ] = useState(false);

  const [
    showSuggestions,
    setShowSuggestions,
  ] = useState(false);

  const wrapperRef = useRef(null);
  const abortRef = useRef(null);
  const requestIdRef = useRef(0);

  const justSelectedRef =
    useRef(false);

  /* =======================================================
     AUTOCOMPLÉTION
  ======================================================= */

  useEffect(() => {
    const text = String(
      value || ""
    ).trim();

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

    const timer = setTimeout(
      async () => {
        const controller =
          new AbortController();

        abortRef.current =
          controller;

        const requestId =
          ++requestIdRef.current;

        setLoadingSuggestions(true);

        try {
          const response =
            await fetch(
              `/api/autocomplete?text=${encodeURIComponent(
                text
              )}`,
              {
                method: "GET",
                cache: "no-store",
                signal:
                  controller.signal,
              }
            );

          if (!response.ok) {
            throw new Error(
              "Erreur lors de la recherche d'adresse."
            );
          }

          const data =
            await response.json();

          if (
            requestId !==
            requestIdRef.current
          ) {
            return;
          }

          const results =
            Array.isArray(
              data.suggestions
            )
              ? data.suggestions
              : [];

          setSuggestions(results);

          setShowSuggestions(
            results.length > 0
          );
        } catch (error) {
          if (
            error?.name ===
            "AbortError"
          ) {
            return;
          }

          console.error(
            "Erreur autocomplétion :",
            error
          );

          if (
            requestId ===
            requestIdRef.current
          ) {
            setSuggestions([]);
            setShowSuggestions(
              false
            );
          }
        } finally {
          if (
            requestId ===
            requestIdRef.current
          ) {
            setLoadingSuggestions(
              false
            );
          }
        }
      },
      220
    );

    return () => {
      clearTimeout(timer);
    };
  }, [value]);

  /* =======================================================
     CLIC EXTÉRIEUR
  ======================================================= */

  useEffect(() => {
    function handleOutsideClick(
      event
    ) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(
          event.target
        )
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

  /* =======================================================
     SÉLECTION
  ======================================================= */

  function handleSelect(
    suggestion
  ) {
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

    onSelect(
      name,
      formatted,
      suggestion
    );
  }

  /* =======================================================
     CHANGEMENT MANUEL
  ======================================================= */

  function handleInputChange(event) {
    justSelectedRef.current =
      false;

    onChange(event);
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      ref={wrapperRef}
      className="relative"
    >
      <label className="block font-semibold mb-2">
        {label}
      </label>

      <div className="relative">
        <input
          type="text"
          name={name}
          value={value}
          onChange={
            handleInputChange
          }
          onFocus={() => {
            if (
              suggestions.length > 0
            ) {
              setShowSuggestions(
                true
              );
            }
          }}
          required
          autoComplete="off"
          placeholder={placeholder}
          className="w-full border border-gray-200 rounded-xl p-4 pr-12 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition"
        />

        {loadingSuggestions && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {showSuggestions &&
        suggestions.length > 0 && (
          <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
            {suggestions.map(
              (
                suggestion,
                index
              ) => {
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
                    onMouseDown={(
                      event
                    ) => {
                      event.preventDefault();

                      handleSelect(
                        suggestion
                      );
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

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const [error, setError] =
    useState("");

  /* =======================================================
     CHANGEMENT FORMULAIRE
  ======================================================= */

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

      /*
       * Samedi et dimanche exclusifs
       */

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

    if (name === "vehicle") {
      setResult(null);
      setError("");
    }
  }

  /* =======================================================
     SÉLECTION ADRESSE
  ======================================================= */

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
                suggestion.latitude ??
                null,

              longitude:
                suggestion.longitude ??
                null,

              postcode:
                suggestion.postcode ||
                "",

              city:
                suggestion.city ||
                "",

              formatted:
                suggestion.formatted ||
                value,

              housenumber:
                suggestion.housenumber ||
                "",

              street:
                suggestion.street ||
                "",
            }
          : null,
      })
    );

    setResult(null);
    setError("");
  }

  /* =======================================================
     SUBMIT
  ======================================================= */

  async function handleSubmit(
    event
  ) {
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
              JSON.stringify(body),
          }
        );

      const data =
        await response.json();

      /*
       * Hors IDF :
       * on affiche le résultat "sur devis"
       * au lieu de le traiter comme une erreur.
       */

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
                behavior:
                  "smooth",
                block:
                  "start",
              });
          }, 50);
        });

        return;
      }

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

      requestAnimationFrame(() => {
        setTimeout(() => {
          document
            .getElementById(
              "resultat-calculateur"
            )
            ?.scrollIntoView({
              behavior:
                "smooth",
              block:
                "start",
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

  const selectedVehicle =
    VEHICLES.find(
      (vehicle) =>
        vehicle.id ===
        form.vehicle
    );

  /* =======================================================
     RENDER
  ======================================================= */

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
            Choisissez votre véhicule,
            indiquez votre trajet et
            obtenez une estimation
            instantanée.
          </p>

        </div>

        {/* =================================================
            FORMULAIRE
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-xl p-8"
        >

          {/* =================================================
              VÉHICULE
          ================================================= */}

          <div>

            <p className="font-bold text-lg mb-4">
              Choisissez votre véhicule
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

              {VEHICLES.map(
                (vehicle) => (
                  <label
                    key={
                      vehicle.id
                    }
                    className={`border rounded-2xl p-5 cursor-pointer transition ${
                      form.vehicle ===
                      vehicle.id
                        ? "border-orange-500 bg-orange-50 shadow-sm"
                        : "border-gray-200 hover:border-orange-300"
                    }`}
                  >

                    <input
                      type="radio"
                      name="vehicle"
                      value={
                        vehicle.id
                      }
                      checked={
                        form.vehicle ===
                        vehicle.id
                      }
                      onChange={
                        handleChange
                      }
                      className="sr-only"
                    />

                    <div className="text-3xl mb-3">
                      {
                        vehicle.icon
                      }
                    </div>

                    <p className="font-bold text-lg">
                      {
                        vehicle.name
                      }
                    </p>

                    {vehicle.volume && (
                      <p className="text-orange-500 font-bold mt-1">
                        {
                          vehicle.volume
                        }
                      </p>
                    )}

                    <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                      {
                        vehicle.description
                      }
                    </p>

                  </label>
                )
              )}

            </div>

          </div>

          {/* =================================================
              ADRESSES
          ================================================= */}

          <div className="grid md:grid-cols-2 gap-6 mt-8">

            <AddressInput
              name="depart"
              label="Ville ou adresse de départ"
              placeholder="Ex. 3 rue Delaporte, Maisons-Alfort"
              value={form.depart}
              onChange={handleChange}
              onSelect={
                handleAddressSelect
              }
            />

            <AddressInput
              name="arrivee"
              label="Ville ou adresse d'arrivée"
              placeholder="Ex. 10 avenue de Paris, Versailles"
              value={form.arrivee}
              onChange={handleChange}
              onSelect={
                handleAddressSelect
              }
            />

          </div>

          {/* =================================================
              PRIORITÉ
          ================================================= */}

          <div className="mt-8">

            <p className="font-bold text-lg mb-4">
              Priorité du transport
            </p>

            <div className="grid sm:grid-cols-3 gap-4">

              <label
                className={`border rounded-xl p-4 cursor-pointer transition ${
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
                  onChange={
                    handleChange
                  }
                  className="mr-3 accent-orange-500"
                />

                <strong>
                  Standard
                </strong>

                <p className="text-gray-500 text-sm mt-1">
                  Tarif normal
                </p>

              </label>

              <label
                className={`border rounded-xl p-4 cursor-pointer transition ${
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
                  onChange={
                    handleChange
                  }
                  className="mr-3 accent-orange-500"
                />

                <strong>
                  Urgent
                </strong>

                <p className="text-gray-500 text-sm mt-1">
                  + selon véhicule
                </p>

              </label>

              <label
                className={`border rounded-xl p-4 cursor-pointer transition ${
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
                  onChange={
                    handleChange
                  }
                  className="mr-3 accent-orange-500"
                />

                <strong>
                  Express / prioritaire
                </strong>

                <p className="text-gray-500 text-sm mt-1">
                  + selon véhicule
                </p>

              </label>

            </div>

          </div>

          {/* =================================================
              CONDITIONS
          ================================================= */}

          <div className="mt-8">

            <p className="font-bold text-lg mb-4">
              Conditions de transport
            </p>

            <div className="grid sm:grid-cols-3 gap-4">

              {/* SAMEDI */}

              <label
                className={`flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition ${
                  form.samedi
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-orange-300"
                }`}
              >

                <input
                  type="checkbox"
                  name="samedi"
                  checked={
                    form.samedi
                  }
                  onChange={
                    handleChange
                  }
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

              <label
                className={`flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition ${
                  form.nuit
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-orange-300"
                }`}
              >

                <input
                  type="checkbox"
                  name="nuit"
                  checked={
                    form.nuit
                  }
                  onChange={
                    handleChange
                  }
                  className="w-5 h-5 accent-orange-500"
                />

                <span>

                  <strong>
                    Nuit 22h–6h
                  </strong>

                  <br />

                  <span className="text-gray-500 text-sm">
                    + selon véhicule
                  </span>

                </span>

              </label>

              {/* DIMANCHE */}

              <label
                className={`flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition ${
                  form.dimanche
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-orange-300"
                }`}
              >

                <input
                  type="checkbox"
                  name="dimanche"
                  checked={
                    form.dimanche
                  }
                  onChange={
                    handleChange
                  }
                  className="w-5 h-5 accent-orange-500"
                />

                <span>

                  <strong>
                    Dimanche / jour férié
                  </strong>

                  <br />

                  <span className="text-gray-500 text-sm">
                    + selon véhicule
                  </span>

                </span>

              </label>

            </div>

          </div>

          {/* =================================================
              RÉSUMÉ VÉHICULE
          ================================================= */}

          <div className="mt-8 bg-gray-50 rounded-2xl p-5 flex items-center gap-4">

            <div className="text-3xl">
              {
                selectedVehicle?.icon
              }
            </div>

            <div>

              <p className="font-bold">
                Véhicule sélectionné :{" "}
                {
                  selectedVehicle?.name
                }
                {selectedVehicle?.volume
                  ? ` — ${selectedVehicle.volume}`
                  : ""}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Tarif calculé selon la
                grille correspondante.
              </p>

            </div>

          </div>

          {/* =================================================
              BOUTON
          ================================================= */}

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full bg-orange-500 text-white font-bold text-lg rounded-xl p-4 hover:bg-orange-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
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
          <div
            id="resultat-calculateur"
            className="mt-8 bg-white rounded-3xl shadow-xl p-8 scroll-mt-8"
          >

            {/* =================================================
                HORS IDF
            ================================================= */}

            {result.reason ===
              "hors_zone" ? (
              <>

                <div className="text-center">

                  <div className="text-5xl mb-4">
                    📍
                  </div>

                  <p className="text-gray-500 font-semibold">
                    Demande de devis
                  </p>

                  <h3 className="text-3xl md:text-4xl font-black mt-3">
                    Trajet hors Île-de-France
                  </h3>

                  <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                    Ce trajet est réalisé
                    sur devis personnalisé.
                    Contactez-nous afin
                    d'obtenir votre tarif.
                  </p>

                </div>

                <div className="mt-8 bg-gray-100 rounded-2xl p-5 text-center">

                  <p className="font-bold text-lg">
                    {
                      result.vehicle
                        ?.label
                    }

                    {result.vehicle
                      ?.volume && (
                      <>
                        {" "}
                        —{" "}
                        {
                          result.vehicle
                            .volume
                        }
                      </>
                    )}
                  </p>

                  <p className="text-gray-500 mt-1">
                    {
                      result.depart
                        ?.zone
                    }{" "}
                    →{" "}
                    {
                      result.arrivee
                        ?.zone
                    }
                  </p>

                </div>

                <a
                  href="#devis"
                  className="mt-6 block w-full text-center bg-orange-500 text-white font-bold rounded-xl p-4 hover:bg-orange-600 transition"
                >
                  Demander mon devis
                </a>

              </>
            ) : (
              <>

                {/* =================================================
                    PRIX
                ================================================= */}

                <div className="text-center">

                  <p className="text-gray-500 font-semibold">
                    Estimation de votre transport
                  </p>

                  <p className="text-5xl font-black mt-3">
                    <span className="text-2xl mr-2">
                      À partir de
                    </span>

                    {result.tarif.totalHT}

                    <span className="text-xl ml-2">
                      € HT
                    </span>
                  </p>

                  <p className="text-gray-500 mt-3">
                    {result.vehicle?.label}

                    {result.vehicle?.volume && (
                      <>
                        {" "}
                        —{" "}
                        {
                          result.vehicle
                            .volume
                        }
                      </>
                    )}

                    {" avec chauffeur"}
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
                      {
                        result.depart
                          .zone
                      }
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      {
                        result.depart
                          .codePostal ||
                        result.depart
                          .ville
                      }
                    </p>

                  </div>

                  <div className="bg-gray-100 rounded-2xl p-5 text-center">

                    <p className="text-gray-500 text-sm">
                      Distance
                    </p>

                    <p className="font-bold text-xl mt-1">
                      {
                        result.trajet
                          .distanceKm
                      }{" "}
                      km
                    </p>

                  </div>

                  <div className="bg-gray-100 rounded-2xl p-5 text-center">

                    <p className="text-gray-500 text-sm">
                      Arrivée
                    </p>

                    <p className="font-bold mt-1">
                      {
                        result.arrivee
                          .zone
                      }
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      {
                        result.arrivee
                          .codePostal ||
                        result.arrivee
                          .ville
                      }
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
                      {
                        result.tarif
                          .baseHT
                      }{" "}
                      € HT
                    </strong>

                  </div>

                  {result.tarif
                    .supplementDistanceHT >
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
                        className="flex justify-between py-2"
                      >

                        <span>
                          {
                            supplement.label
                          }
                        </span>

                        <strong>
                          {
                            supplement.amount !==
                            null
                              ? `+${supplement.amount} €`
                              : "Appliqué"
                          }
                        </strong>

                      </div>
                    )
                  )}

                </div>

                {/* =================================================
                    INFORMATIONS
                ================================================= */}

                <div className="mt-6 bg-orange-50 rounded-2xl p-5">

                  <p className="font-bold">
                    À prévoir en supplément
                  </p>

                  <p className="text-gray-600 text-sm mt-2">
                    Péages facturés en
                    supplément.
                    Manutention sur devis.
                  </p>

                </div>

                {/* =================================================
                    DISCLAIMER
                ================================================= */}

                <div className="mt-6 text-center">

                  <p className="text-xs text-gray-500 leading-relaxed">
                    Tarif indicatif calculé
                    automatiquement.
                    Le montant définitif
                    peut être ajusté selon
                    les conditions réelles
                    de la mission, notamment
                    l'accès, le stationnement,
                    la manutention ou les
                    contraintes particulières.
                  </p>

                </div>

                {/* =================================================
                    DEVIS
                ================================================= */}

                <a
                  href="#devis"
                  className="mt-6 block w-full text-center bg-orange-500 text-white font-bold rounded-xl p-4 hover:bg-orange-600 transition"
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