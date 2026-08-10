import { NextResponse } from "next/server";

const GEOAPIFY_API_KEY =
  process.env.GEOAPIFY_API_KEY;

/* =========================================================
   ZONES TARIFAIRES
========================================================= */

function getZoneFromPostcode(postcode) {
  if (!postcode) return null;

  const cp = String(postcode).trim();

  // Paris
  if (/^750\d{2}$/.test(cp)) {
    return "paris";
  }

  // Petite couronne
  if (/^(92|93|94)\d{3}$/.test(cp)) {
    return "petite_couronne";
  }

  // Grande couronne
  if (/^(77|78|91|95)\d{3}$/.test(cp)) {
    return "grande_couronne";
  }

  return null;
}

/* =========================================================
   TARIF DE BASE
========================================================= */

function getBasePrice(
  zoneDepart,
  zoneArrivee
) {
  if (!zoneDepart || !zoneArrivee) {
    return null;
  }

  // Paris → Paris
  if (
    zoneDepart === "paris" &&
    zoneArrivee === "paris"
  ) {
    return 89;
  }

  // Paris ↔ Petite couronne
  if (
    (zoneDepart === "paris" &&
      zoneArrivee === "petite_couronne") ||
    (zoneDepart === "petite_couronne" &&
      zoneArrivee === "paris")
  ) {
    return 99;
  }

  // Petite couronne ↔ Petite couronne
  if (
    zoneDepart === "petite_couronne" &&
    zoneArrivee === "petite_couronne"
  ) {
    return 99;
  }

  // Paris ↔ Grande couronne
  if (
    (zoneDepart === "paris" &&
      zoneArrivee === "grande_couronne") ||
    (zoneDepart === "grande_couronne" &&
      zoneArrivee === "paris")
  ) {
    return 129;
  }

  // Petite couronne ↔ Grande couronne
  if (
    (zoneDepart === "petite_couronne" &&
      zoneArrivee === "grande_couronne") ||
    (zoneDepart === "grande_couronne" &&
      zoneArrivee === "petite_couronne")
  ) {
    return 119;
  }

  // Grande couronne ↔ Grande couronne
  if (
    zoneDepart === "grande_couronne" &&
    zoneArrivee === "grande_couronne"
  ) {
    return 129;
  }

  return null;
}

/* =========================================================
   SUPPLÉMENT DISTANCE
========================================================= */

function getDistanceSupplement(distanceKm) {
  if (distanceKm <= 10) return 0;
  if (distanceKm <= 20) return 10;
  if (distanceKm <= 30) return 15;
  if (distanceKm <= 40) return 20;
  if (distanceKm <= 50) return 25;
  if (distanceKm <= 75) return 35;
  if (distanceKm <= 100) return 50;

  // Au-delà de 100 km :
  // on conserve +50 € pour l'estimation.
  return 50;
}

/* =========================================================
   LABEL ZONE
========================================================= */

function getZoneLabel(zone) {
  switch (zone) {
    case "paris":
      return "Paris";

    case "petite_couronne":
      return "Petite couronne";

    case "grande_couronne":
      return "Grande couronne";

    default:
      return "Hors zone";
  }
}

/* =========================================================
   UTILITAIRES AUTOCOMPLETE
========================================================= */

function cleanText(text) {
  return String(text || "")
    .trim()
    .replace(/\s+/g, " ");
}

/*
 * Détecte un numéro au début de l'adresse.
 *
 * Exemples :
 * 6 rue Delaporte
 * 6A rue Delaporte
 * 6 bis rue Delaporte
 * 12-14 avenue de Paris
 */
function extractHouseNumber(text) {
  const match = text.match(
    /^\s*(\d+(?:[A-Za-z])?(?:\s*(?:bis|ter|quater))?(?:\s*[-\/]\s*\d+(?:[A-Za-z])?)?)/i
  );

  return match
    ? match[1].trim()
    : null;
}

/*
 * Vérifie si le résultat contient bien
 * un numéro de bâtiment.
 */
function hasHouseNumber(
  properties,
  formatted
) {
  const returnedHouseNumber = cleanText(
    properties.housenumber ||
      properties.house_number ||
      ""
  );

  if (returnedHouseNumber) {
    return true;
  }

  return /^\s*\d+(?:[A-Za-z])?\b/.test(
    formatted
  );
}

/*
 * Calcule un score pour classer les résultats.
 *
 * Priorité :
 * 1. même numéro demandé
 * 2. adresse précise
 * 3. bâtiment / maison
 * 4. rue
 */
function scoreSuggestion(
  feature,
  originalText
) {
  const properties =
    feature.properties || {};

  const formatted = cleanText(
    properties.formatted ||
      properties.address_line1 ||
      ""
  );

  const requestedNumber =
    extractHouseNumber(
      originalText
    );

  let score = 0;

  const resultType = String(
    properties.result_type || ""
  ).toLowerCase();

  const category = String(
    properties.category || ""
  ).toLowerCase();

  const returnedNumber =
    cleanText(
      properties.housenumber ||
        properties.house_number ||
        ""
    );

  /* -------------------------------------------------------
     NUMÉRO
  ------------------------------------------------------- */

  if (requestedNumber) {
    if (returnedNumber) {
      score += 100;
    }

    if (
      returnedNumber.toLowerCase() ===
      requestedNumber.toLowerCase()
    ) {
      score += 300;
    }

    const escapedNumber =
      requestedNumber.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

    if (
      new RegExp(
        `^\\s*${escapedNumber}\\b`,
        "i"
      ).test(formatted)
    ) {
      score += 300;
    }
  }

  /* -------------------------------------------------------
     TYPE DE RÉSULTAT
  ------------------------------------------------------- */

  if (
    resultType === "building" ||
    resultType === "house"
  ) {
    score += 100;
  }

  if (
    category.includes("building") ||
    category.includes("residential")
  ) {
    score += 40;
  }

  if (resultType === "street") {
    score -= 100;
  }

  if (resultType === "city") {
    score -= 150;
  }

  /* -------------------------------------------------------
     ADRESSE COMPLÈTE
  ------------------------------------------------------- */

  if (
    properties.postcode &&
    (
      properties.city ||
      properties.town ||
      properties.village
    )
  ) {
    score += 30;
  }

  if (
    properties.address_line1 &&
    properties.address_line2
  ) {
    score += 20;
  }

  /* -------------------------------------------------------
     CORRESPONDANCE DES MOTS
  ------------------------------------------------------- */

  const normalizedOriginal =
    cleanText(
      originalText
    ).toLowerCase();

  const normalizedFormatted =
    formatted.toLowerCase();

  const words =
    normalizedOriginal
      .split(/[\s,]+/)
      .filter(
        (word) =>
          word.length >= 2
      );

  for (const word of words) {
    if (
      normalizedFormatted.includes(
        word
      )
    ) {
      score += 5;
    }
  }

  return score;
}

/* =========================================================
   FETCH GEOAPIFY
========================================================= */

async function fetchGeoapify(url) {
  const response =
    await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `Geoapify ${response.status}: ${errorText}`
    );
  }

  return response.json();
}

/* =========================================================
   GEOCODAGE CLASSIQUE
========================================================= */

async function geocode(address) {
  const url =
    `https://api.geoapify.com/v1/geocode/search` +
    `?text=${encodeURIComponent(address)}` +
    `&limit=5` +
    `&filter=countrycode:fr` +
    `&lang=fr` +
    `&apiKey=${GEOAPIFY_API_KEY}`;

  const data =
    await fetchGeoapify(url);

  if (
    !data.features ||
    data.features.length === 0
  ) {
    throw new Error(
      `Adresse introuvable : ${address}`
    );
  }

  /*
   * On cherche en priorité un résultat
   * qui possède réellement un numéro.
   */
  const features =
    [...data.features].sort(
      (a, b) => {
        const aProperties =
          a.properties || {};

        const bProperties =
          b.properties || {};

        const aFormatted =
          aProperties.formatted ||
          "";

        const bFormatted =
          bProperties.formatted ||
          "";

        const aNumber =
          hasHouseNumber(
            aProperties,
            aFormatted
          );

        const bNumber =
          hasHouseNumber(
            bProperties,
            bFormatted
          );

        if (
          aNumber !== bNumber
        ) {
          return aNumber
            ? -1
            : 1;
        }

        return (
          Number(
            bProperties.rank
              ?.confidence || 0
          ) -
          Number(
            aProperties.rank
              ?.confidence || 0
          )
        );
      }
    );

  const feature =
    features[0];

  const properties =
    feature.properties || {};

  const coordinates =
    feature.geometry
      ?.coordinates;

  if (
    !coordinates ||
    coordinates.length < 2
  ) {
    throw new Error(
      `Coordonnées introuvables : ${address}`
    );
  }

  return {
    latitude:
      coordinates[1],

    longitude:
      coordinates[0],

    formatted:
      properties.formatted ||
      address,

    postcode:
      properties.postcode ||
      null,

    city:
      properties.city ||
      properties.town ||
      properties.village ||
      properties.municipality ||
      null,

    zone:
      getZoneFromPostcode(
        properties.postcode
      ),
  };
}

/* =========================================================
   CALCUL ITINÉRAIRE
========================================================= */

async function calculateRoute(
  depart,
  arrivee
) {
  const url =
    `https://api.geoapify.com/v1/routing` +
    `?waypoints=${depart.latitude},${depart.longitude}|${arrivee.latitude},${arrivee.longitude}` +
    `&mode=drive` +
    `&apiKey=${GEOAPIFY_API_KEY}`;

  const data =
    await fetchGeoapify(url);

  if (
    !data.features ||
    data.features.length === 0
  ) {
    throw new Error(
      "Impossible de calculer l'itinéraire."
    );
  }

  const properties =
    data.features[0]
      .properties || {};

  const distanceMeters =
    properties.distance ||
    properties.distance_meters ||
    properties.distances?.[0];

  const timeSeconds =
    properties.time ||
    properties.time_seconds ||
    properties.duration;

  if (
    distanceMeters === undefined ||
    distanceMeters === null
  ) {
    throw new Error(
      "Distance non disponible."
    );
  }

  return {
    distanceKm:
      Number(
        (
          distanceMeters / 1000
        ).toFixed(1)
      ),

    durationMinutes:
      timeSeconds
        ? Math.round(
            timeSeconds / 60
          )
        : null,
  };
}

/* =========================================================
   CALCUL PRIX
========================================================= */

function calculatePrice({
  basePrice,
  distanceKm,
  urgent,
  express,
  attente,
  samedi,
  nuit,
  dimanche,
}) {
  const distanceSupplement =
    getDistanceSupplement(
      distanceKm
    );

  let price =
    basePrice +
    distanceSupplement;

  const supplements = [];

  /* Urgent */

  if (urgent) {
    price += 20;

    supplements.push({
      label: "Urgent",
      amount: 20,
    });
  }

  /* Express */

  if (express) {
    price += 40;

    supplements.push({
      label:
        "Express / véhicule dédié prioritaire",
      amount: 40,
    });
  }

  /* Attente */

  if (attente) {
    price += 30;

    supplements.push({
      label:
        "Attente 30 min",
      amount: 30,
    });
  }

  /* Pourcentages */

  let percentage = 1;

  if (samedi) {
    percentage += 0.10;
  }

  if (nuit) {
    percentage += 0.25;
  }

  if (dimanche) {
    percentage += 0.30;
  }

  const percentageSupplement =
    price *
    (percentage - 1);

  if (
    percentageSupplement > 0
  ) {
    price +=
      percentageSupplement;

    if (samedi) {
      supplements.push({
        label:
          "Samedi +10 %",
        amount: null,
      });
    }

    if (nuit) {
      supplements.push({
        label:
          "Nuit 22h–6h +25 %",
        amount: null,
      });
    }

    if (dimanche) {
      supplements.push({
        label:
          "Dimanche / jour férié +30 %",
        amount: null,
      });
    }
  }

  return {
    totalHT:
      Math.round(price),

    distanceSupplement,

    supplements,
  };
}

/* =========================================================
   GET
   - AUTOCOMPLETE
========================================================= */

export async function GET(
  request
) {
  try {
    if (!GEOAPIFY_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error:
            "GEOAPIFY_API_KEY non configurée.",
        },
        {
          status: 500,
        }
      );
    }

    const {
      searchParams,
    } = new URL(
      request.url
    );

    /*
     * Le composant React envoie :
     *
     * /api/calculateur?autocomplete=...
     */

    const text =
      cleanText(
        searchParams.get(
          "autocomplete"
        ) ||
          searchParams.get(
            "text"
          ) ||
          ""
      );

    if (text.length < 3) {
      return NextResponse.json({
        success: true,
        results: [],
      });
    }

    const requestedNumber =
      extractHouseNumber(
        text
      );

    let features = [];

    /* -----------------------------------------------------
       REQUÊTE 1 : AUTOCOMPLETE
    ----------------------------------------------------- */

    const autocompleteUrl =
      `https://api.geoapify.com/v1/geocode/autocomplete` +
      `?text=${encodeURIComponent(text)}` +
      `&limit=10` +
      `&filter=countrycode:fr` +
      `&lang=fr` +
      `&apiKey=${GEOAPIFY_API_KEY}`;

    try {
      const autocompleteData =
        await fetchGeoapify(
          autocompleteUrl
        );

      features.push(
        ...(autocompleteData.features ||
          [])
      );
    } catch (error) {
      console.warn(
        "Autocomplete Geoapify :",
        error.message
      );
    }

    /* -----------------------------------------------------
       REQUÊTE 2 :
       RECHERCHE PRÉCISE SI NUMÉRO
    ----------------------------------------------------- */

    if (requestedNumber) {
      const searchUrl =
        `https://api.geoapify.com/v1/geocode/search` +
        `?text=${encodeURIComponent(text)}` +
        `&housenumber=${encodeURIComponent(requestedNumber)}` +
        `&limit=10` +
        `&filter=countrycode:fr` +
        `&lang=fr` +
        `&apiKey=${GEOAPIFY_API_KEY}`;

      try {
        const searchData =
          await fetchGeoapify(
            searchUrl
          );

        features.push(
          ...(searchData.features ||
            [])
        );
      } catch (error) {
        console.warn(
          "Recherche adresse précise :",
          error.message
        );
      }
    }

    /* -----------------------------------------------------
       SUPPRESSION DES DOUBLONS
    ----------------------------------------------------- */

    const unique =
      new Map();

    for (const feature of features) {
      const properties =
        feature.properties ||
        {};

      const coordinates =
        feature.geometry
          ?.coordinates ||
        [];

      const key =
        properties.place_id ||
        [
          properties.formatted,
          coordinates[0],
          coordinates[1],
        ].join("|");

      if (!unique.has(key)) {
        unique.set(
          key,
          feature
        );
      }
    }

    /* -----------------------------------------------------
       TRI
    ----------------------------------------------------- */

    const sorted =
      Array.from(
        unique.values()
      )
        .map(
          (feature) => ({
            feature,
            score:
              scoreSuggestion(
                feature,
                text
              ),
          })
        )
        .sort(
          (a, b) =>
            b.score -
            a.score
        );

    /* -----------------------------------------------------
       RÉSULTATS POUR REACT
    ----------------------------------------------------- */

    const results =
      sorted
        .slice(0, 6)
        .map(
          ({
            feature,
            score,
          }) => {
            const properties =
              feature.properties ||
              {};

            return {
              properties: {
                ...properties,

                housenumber:
                  properties.housenumber ||
                  properties.house_number ||
                  "",

                street:
                  properties.street ||
                  "",

                postcode:
                  properties.postcode ||
                  "",

                city:
                  properties.city ||
                  properties.town ||
                  properties.village ||
                  properties.municipality ||
                  "",

                formatted:
                  properties.formatted ||
                  "",

                address_line1:
                  properties.address_line1 ||
                  "",

                address_line2:
                  properties.address_line2 ||
                  "",

                result_type:
                  properties.result_type ||
                  "",

                place_id:
                  properties.place_id ||
                  "",
              },

              geometry:
                feature.geometry,

              score,
            };
          }
        );

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error(
      "Autocomplete Geoapify :",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          "Erreur autocomplete.",
        results: [],
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   POST
   - CALCULATEUR
========================================================= */

export async function POST(
  request
) {
  try {
    if (!GEOAPIFY_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error:
            "GEOAPIFY_API_KEY non configurée.",
        },
        {
          status: 500,
        }
      );
    }

    const body =
      await request.json();

    const {
      depart,
      arrivee,

      urgent = false,
      express = false,
      attente = false,
      samedi = false,
      nuit = false,
      dimanche = false,
    } = body;

    if (
      !depart ||
      !arrivee
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Les adresses de départ et d'arrivée sont obligatoires.",
        },
        {
          status: 400,
        }
      );
    }

    /* -----------------------------------------------------
       1. GÉOCODAGE
    ----------------------------------------------------- */

    const departGeo =
      await geocode(
        depart
      );

    const arriveeGeo =
      await geocode(
        arrivee
      );

    /* -----------------------------------------------------
       2. ZONES
    ----------------------------------------------------- */

    if (
      !departGeo.zone ||
      !arriveeGeo.zone
    ) {
      return NextResponse.json({
        success: false,
        reason:
          "hors_zone",

        message:
          "Cette adresse est en dehors de la zone tarifaire automatique. Demandez un devis personnalisé.",

        depart: departGeo,

        arrivee:
          arriveeGeo,
      });
    }

    /* -----------------------------------------------------
       3. ITINÉRAIRE
    ----------------------------------------------------- */

    const route =
      await calculateRoute(
        departGeo,
        arriveeGeo
      );

    /* -----------------------------------------------------
       4. TARIF DE BASE
    ----------------------------------------------------- */

    const basePrice =
      getBasePrice(
        departGeo.zone,
        arriveeGeo.zone
      );

    if (
      basePrice === null
    ) {
      return NextResponse.json({
        success: false,

        reason:
          "tarif_non_disponible",

        message:
          "Ce trajet nécessite une étude personnalisée.",
      });
    }

    /* -----------------------------------------------------
       5. CALCUL FINAL
    ----------------------------------------------------- */

    const calculation =
      calculatePrice({
        basePrice,

        distanceKm:
          route.distanceKm,

        urgent,
        express,
        attente,
        samedi,
        nuit,
        dimanche,
      });

    /* -----------------------------------------------------
       6. RÉPONSE
    ----------------------------------------------------- */

    return NextResponse.json({
      success: true,

      vehicle:
        "20 m³ avec chauffeur",

      depart: {
        adresse:
          departGeo.formatted,

        ville:
          departGeo.city,

        codePostal:
          departGeo.postcode,

        zone:
          getZoneLabel(
            departGeo.zone
          ),
      },

      arrivee: {
        adresse:
          arriveeGeo.formatted,

        ville:
          arriveeGeo.city,

        codePostal:
          arriveeGeo.postcode,

        zone:
          getZoneLabel(
            arriveeGeo.zone
          ),
      },

      trajet: {
        distanceKm:
          route.distanceKm,

        dureeMinutes:
          route.durationMinutes,
      },

      tarif: {
        baseHT:
          basePrice,

        supplementDistanceHT:
          calculation.distanceSupplement,

        totalHT:
          calculation.totalHT,
      },

      supplements:
        calculation.supplements,

      fraisSupplementaires: {
        peages:
          "Facturés en supplément",

        manutention:
          "Sur devis",
      },

      message:
        "Tarif indicatif. Le montant définitif peut être ajusté selon les conditions réelles de la mission.",
    });
  } catch (error) {
    console.error(
      "Calculateur Flashride :",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error.message ||
          "Une erreur est survenue pendant le calcul.",
      },
      {
        status: 500,
      }
    );
  }
}