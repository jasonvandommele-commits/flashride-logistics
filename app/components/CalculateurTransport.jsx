"use client";

import { useEffect, useRef, useState } from ""use client";
import { useEffect, useRef, useState } from "react";
const EMPTY_FORM = {
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
  const abortControllerRef = useRef(null);
  const requestIdRef = useRef(0);
  useEffect(() => {
    const text = value.trim();
    if (text.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      setLoadingSuggestions(false);
      return;
    }
    const timer = setTimeout(async () => {
      // Annule la recherche précédente
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const currentRequestId = ++requestIdRef.current;
      setLoadingSuggestions(true);
      try {
        const response = await fetch(
          `/api/calculateur?autocomplete=${encodeURIComponent(text)}`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          }
        );
        if (!response.ok) {
          throw new Error("Erreur lors de la recherche.");
        }
        const data = await response.json();
        // Ignore une réponse devenue obsolète
        if (currentRequestId !== requestIdRef.current) {
          return;
        }
        const results = Array.isArray(data.results)
          ? data.results
          : [];
        /*
         * Priorité aux résultats les plus précis.
         *
         * Lorsqu'un utilisateur tape un numéro,
         * on favorise fortement les résultats contenant
         * eux-mêmes un numéro.
         */
        const hasNumber = /^\s*\d+\s/.test(text);
        const sortedResults = [...results].sort((a, b) => {
          const aProperties = a.properties || {};
          const bProperties = b.properties || {};
          const aFormatted =
            aProperties.formatted ||
            aProperties.address_line1 ||
            "";
          const bFormatted =
            bProperties.formatted ||
            bProperties.address_line1 ||
            "";
          const aHasNumber = /\b\d+[A-Za-z]?\b/.test(
            aFormatted
          );
          const bHasNumber = /\b\d+[A-Za-z]?\b/.test(
            bFormatted
          );
          // Si l'utilisateur a saisi un numéro,
          // les résultats avec numéro passent en premier.
          if (hasNumber && aHasNumber !== bHasNumber) {
            return aHasNumber ? -1 : 1;
          }
          // Priorité aux résultats de type adresse.
          const aType = aProperties.result_type || "";
          const bType = bProperties.result_type || "";
          const addressTypes = [
            "building",
            "house",
            "street",
            "amenity",
          ];
          const aIsAddress = addressTypes.includes(aType);
          const bIsAddress = addressTypes.includes(bType);
          if (aIsAddress !== bIsAddress) {
            return aIsAddress ? -1 : 1;
          }
          return 0;
        });
        setSuggestions(sortedResults.slice(0, 6));
        setShowSuggestions(sortedResults.length > 0);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(
            "Autocomplétion adresse:",
            error
          );
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setLoadingSuggestions(false);
        }
      }
    }, 250);
    return () => clearTimeout(timer);
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
    const properties = suggestion.properties || {};
    const formatted =
      properties.formatted ||
      properties.address_line1 ||
      properties.address_line2 ||
      "";
    onSelect(name, formatted);
    setSuggestions([]);
    setShowSuggestions(false);
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
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => {
            if (suggestions.length > 0) {
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
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
          {suggestions.map((suggestion, index) => {
            const properties =
              suggestion.properties || {};
            const formatted =
              properties.formatted ||
              properties.address_line1 ||
              "";
            const addressLine1 =
              properties.address_line1 || "";
            const addressLine2 =
              properties.address_line2 || "";
            const postcode =
              properties.postcode || "";
            const city =
              properties.city ||
              properties.town ||
              properties.village ||
              "";
            return (
              <button
                key={
                  suggestion.properties?.place_id ||
                  `${formatted}-${index}`
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
                    <p className="font-semibold text-gray-900 truncate">
                      {addressLine1 || formatted}
                    </p>
                    {(addressLine2 ||
                      postcode ||
                      city) && (
                      <p className="text-sm text-gray-500 mt-1 truncate">
                        {addressLine2 ||
                          `${postcode} ${city}`}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
export default function CalculateurTransport() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
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
    // Si l'utilisateur modifie une adresse,
    // on retire l'ancien résultat.
    if (
      name === "depart" ||
      name === "arrivee"
    ) {
      setResult(null);
      setError("");
    }
  }
  function handleAddressSelect(name, value) {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
    setResult(null);
    setError("");
  }
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch(
        "/api/calculateur",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            data.error ||
            "Impossible de calculer le tarif."
        );
      }
      setResult(data);
      // On remonte automatiquement vers le résultat.
      setTimeout(() => {
        document
          .getElementById(
            "resultat-calculateur"
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 100);
    } catch (err) {
      setError(
        err.message ||
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
          <div className="mt-8">
            <p className="font-bold text-lg mb-4">
              Options
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 border rounded-xl p-4 cursor-pointer hover:border-orange-300 transition">
                <input
                  type="checkbox"
                  name="urgent"
                  checked={form.urgent}
                  onChange={handleChange}
                  className="w-5 h-5 accent-orange-500"
                />
                <span>
                  <strong>Urgent</strong>
                  <br />
                  <span className="text-gray-500 text-sm">
                    +20 € HT
                  </span>
                </span>
              </label>
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
              <label className="flex items-center gap-3 border rounded-xl p-4 cursor-pointer hover:border-orange-300 transition">
                <input
                  type="checkbox"
                  name="samedi"
                  checked={form.samedi}
                  onChange={handleChange}
                  className="w-5 h-5 accent-orange-500"
                />
                <span>
                  <strong>Samedi</strong>
                  <br />
                  <span className="text-gray-500 text-sm">
                    +10 %
                  </span>
                </span>
              </label>
              <label className="flex items-center gap-3 border rounded-xl p-4 cursor-pointer hover:border-orange-300 transition">
                <input
                  type="checkbox"
                  name="nuit"
                  checked={form.nuit}
                  onChange={handleChange}
                  className="w-5 h-5 accent-orange-500"
                />
                <span>
                  <strong>Nuit 22h–6h</strong>
                  <br />
                  <span className="text-gray-500 text-sm">
                    +25 %
                  </span>
                </span>
              </label>
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
                {result.tarif.totalHT} €
                <span className="text-xl ml-2">
                  HT
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
              {result.tarif.supplementDistanceHT >
                0 && (
                <div className="flex justify-between py-2">
                  <span>
                    Ajustement distance
                  </span>
                  <strong>
                    +{result.tarif.supplementDistanceHT} €
                  </strong>
                </div>
              )}
              {result.supplements?.map(
                (supplement, index) => (
                  <div
                    key={index}
                    className="flex justify-between py-2"
                  >
                    <span>
                      {supplement.label}
                    </span>
                    <strong>
                      {supplement.amount !== null
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
                Tarif indicatif calculé automatiquement.
                Le montant définitif peut être ajusté
                selon les conditions réelles de la mission,
                notamment l'accès, le stationnement,
                la manutention ou les contraintes
                particulières.
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

function AddressAutocomplete({
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);

    if (!value || value.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      return;
    }

    debounceRef.current = setTimeout(async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        setLoading(true);

        const response = await fetch(
          `/api/adresse?text=${encodeURIComponent(
            value.trim()
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

        const data = await response.json();

        if (controller.signal.aborted) {
          return;
        }

        if (data.success && Array.isArray(data.results)) {
          setSuggestions(data.results);
          setOpen(data.results.length > 0);
        } else {
          setSuggestions([]);
          setOpen(false);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(
            "Erreur autocomplétion :",
            error
          );

          setSuggestions([]);
          setOpen(false);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 180);

    return () => {
      clearTimeout(debounceRef.current);
    };
  }, [value]);

  function selectSuggestion(suggestion) {
    onChange({
      target: {
        name,
        value: suggestion.label,
      },
    });

    setSuggestions([]);
    setOpen(false);
  }

  return (
    <div
      ref={wrapperRef}
      className="relative"
    >
      <input
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => {
          if (suggestions.length > 0) {
            setOpen(true);
          }
        }}
        required={required}
        autoComplete="off"
        spellCheck="false"
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl p-4 pr-12 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition"
      />

      {loading && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin" />
        </div>
      )}

      {open && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">

          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.label}-${index}`}
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                selectSuggestion(suggestion);
              }}
              className="w-full text-left px-5 py-4 hover:bg-orange-50 transition border-b last:border-b-0 border-gray-100"
            >
              <div className="flex items-start gap-3">

                <div className="mt-1 flex-shrink-0">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-orange-500"
                  >
                    <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                    <circle
                      cx="12"
                      cy="10"
                      r="2.5"
                    />
                  </svg>
                </div>

                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">
                    {suggestion.primary}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    {suggestion.secondary}
                  </p>
                </div>

              </div>
            </button>
          ))}

        </div>
      )}
    </div>
  );
}

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

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

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

    if (error) {
      setError("");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "/api/calculateur",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
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

            <div>
              <label className="block font-semibold mb-2">
                Ville ou adresse de départ
              </label>

              <AddressAutocomplete
                name="depart"
                value={form.depart}
                onChange={handleChange}
                required
                placeholder="Ex. 3 rue Delaporte, Maisons-Alfort"
              />

              <p className="text-xs text-gray-400 mt-2">
                Saisissez une adresse et sélectionnez
                une suggestion.
              </p>
            </div>

            <div>
              <label className="block font-semibold mb-2">
                Ville ou adresse d'arrivée
              </label>

              <AddressAutocomplete
                name="arrivee"
                value={form.arrivee}
                onChange={handleChange}
                required
                placeholder="Ex. 10 avenue de Paris, Versailles"
              />

              <p className="text-xs text-gray-400 mt-2">
                Saisissez une adresse et sélectionnez
                une suggestion.
              </p>
            </div>

          </div>

          <div className="mt-8">

            <p className="font-bold text-lg mb-4">
              Options
            </p>

            <div className="grid sm:grid-cols-2 gap-4">

              <label className="flex items-center gap-3 border rounded-xl p-4 cursor-pointer hover:border-orange-300 transition">
                <input
                  type="checkbox"
                  name="urgent"
                  checked={form.urgent}
                  onChange={handleChange}
                  className="w-5 h-5 accent-orange-500"
                />

                <span>
                  <strong>Urgent</strong>
                  <br />
                  <span className="text-gray-500 text-sm">
                    +20 € HT
                  </span>
                </span>
              </label>

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

              <label className="flex items-center gap-3 border rounded-xl p-4 cursor-pointer hover:border-orange-300 transition">
                <input
                  type="checkbox"
                  name="samedi"
                  checked={form.samedi}
                  onChange={handleChange}
                  className="w-5 h-5 accent-orange-500"
                />

                <span>
                  <strong>Samedi</strong>
                  <br />
                  <span className="text-gray-500 text-sm">
                    +10 %
                  </span>
                </span>
              </label>

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

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-5 text-center">
            {error}
          </div>
        )}

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

              {result.tarif.supplementDistanceHT > 0 && (
                <div className="flex justify-between py-2">
                  <span>
                    Ajustement distance
                  </span>

                  <strong>
                    +{result.tarif.supplementDistanceHT} €
                  </strong>
                </div>
              )}

              {result.supplements.map(
                (supplement, index) => (
                  <div
                    key={index}
                    className="flex justify-between py-2"
                  >
                    <span>
                      {supplement.label}
                    </span>

                    <strong>
                      {supplement.amount !== null
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
                Tarif indicatif calculé automatiquement.
                Le montant définitif peut être ajusté selon
                les conditions réelles de la mission,
                notamment l'accès, le stationnement,
                la manutention ou les contraintes particulières.
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