"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

const INITIAL_FORM = {
  depart: "",
  arrivee: "",
  urgent: false,
  express: false,
  attente: false,
  samedi: false,
  nuit: false,
  dimanche: false,
};

function AddressInput({
  name,
  label,
  placeholder,
  value,
  onChange,
  onSelect,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const wrapperRef = useRef(null);
  const abortRef = useRef(null);
  const requestIdRef = useRef(0);

  // Empêche une nouvelle recherche après
  // la sélection d'une suggestion.
  const selectionRef = useRef(false);

  useEffect(() => {
    // Une adresse vient d'être sélectionnée.
    // Le changement de value ne doit donc pas
    // déclencher une nouvelle recherche.
    if (selectionRef.current) {
      selectionRef.current = false;
      return;
    }

    const text = String(value || "").trim();

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

      const requestId =
        ++requestIdRef.current;

      setLoadingSuggestions(true);

      try {
        const response = await fetch(
          `/api/autocomplete?text=${encodeURIComponent(
            text
          )}`,
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
          error?.name === "AbortError"
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
          setShowSuggestions(false);
        }
      } finally {
        if (
          requestId ===
          requestIdRef.current
        ) {
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

  function handleSelect(suggestion) {
    const formatted =
      suggestion.formatted ||
      [
        suggestion.housenumber,
        suggestion.street,
      ]
        .filter(Boolean)
        .join(" ");

    if (!formatted) {
      return;
    }

    // Signale au useEffect que le changement
    // de value vient d'une sélection utilisateur.
    selectionRef.current = true;

    // Annule immédiatement toute recherche
    // encore en cours.
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }

    // Invalide les anciennes requêtes.
    requestIdRef.current += 1;

    onSelect(
      name,
      formatted,
      suggestion
    );

    setSuggestions([]);
    setShowSuggestions(false);
    setLoadingSuggestions(false);
  }

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
          onChange={onChange}
          onFocus={() => {
            if (
              suggestions.length > 0
            ) {
              setShowSuggestions(true);
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

export default function CalculateurTransport() {
  const [form, setForm] =
    useState(INITIAL_FORM);

  const [selectedAddresses, setSelectedAddresses] =
    useState({
      depart: null,
      arrivee: null,
    });

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const [error, setError] =
    useState("");

  function handleChange(event) {
    const {
      name,
      value,
      checked,
      type,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

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
    <section className="py-24 px-6 bg-gray-100">
      <div className="max-w-5xl mx-auto">

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

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-xl p-8"
        >
          <div className="grid md:grid-cols-2 gap-6">

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

          <div className="mt-8">
            <p className="font-bold text-lg mb-4">
              Options
            </p>

            <div className="grid sm:grid-cols-2 gap-4">

              {[
                [
                  "urgent",
                  "Urgent",
                  "+20 € HT",
                ],
                [
                  "express",
                  "Express / prioritaire",
                  "+40 € HT",
                ],
                [
                  "attente",
                  "Attente 30 min",
                  "+30 € HT",
                ],
                [
                  "samedi",
                  "Samedi",
                  "+10 %",
                ],
                [
                  "nuit",
                  "Nuit 22h–6h",
                  "+25 %",
                ],
                [
                  "dimanche",
                  "Dimanche / jour férié",
                  "+30 %",
                ],
              ].map(
                ([
                  name,
                  title,
                  price,
                ]) => (
                  <label
                    key={name}
                    className="flex items-center gap-3 border rounded-xl p-4 cursor-pointer hover:border-orange-300 transition"
                  >
                    <input
                      type="checkbox"
                      name={name}
                      checked={form[name]}
                      onChange={
                        handleChange
                      }
                      className="w-5 h-5 accent-orange-500"
                    />

                    <span>
                      <strong>
                        {title}
                      </strong>

                      <br />

                      <span className="text-gray-500 text-sm">
                        {price}
                      </span>
                    </span>
                  </label>
                )
              )}

            </div>
          </div>

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

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-5 text-center">
            {error}
          </div>
        )}

        {result && (
          <div
            id="resultat-calculateur"
            className="mt-8 bg-white rounded-3xl shadow-xl p-8 scroll-mt-8"
          >
            <div className="text-center">

              <p className="text-gray-500 font-semibold">
                Estimation de votre transport
              </p>

              <p className="text-5xl font-black mt-3">
                {result.tarif.totalHT}{" "}
                <span className="text-xl ml-2">
                  € HT
                </span>
              </p>

              <p className="text-gray-500 mt-2">
                Transport 20 m³ avec chauffeur
              </p>

            </div>

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

            <div className="mt-8 border-t pt-6">

              <div className="flex justify-between py-2">
                <span>
                  Tarif de base
                </span>

                <strong>
                  {result.tarif.baseHT} € HT
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
                    €
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

            <div className="mt-6 bg-orange-50 rounded-2xl p-5">

              <p className="font-bold">
                À prévoir en supplément
              </p>

              <p className="text-gray-600 text-sm mt-2">
                Péages facturés en supplément.
                Manutention sur devis.
              </p>

            </div>

            <div className="mt-6 text-center">

              <p className="text-xs text-gray-500 leading-relaxed">
                Tarif indicatif calculé
                automatiquement. Le montant
                définitif peut être ajusté selon
                les conditions réelles de la
                mission, notamment l'accès,
                le stationnement, la manutention
                ou les contraintes particulières.
              </p>

            </div>

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