import { NextResponse } from "next/server";

const GEOAPIFY_API_KEY =
  process.env.GEOAPIFY_API_KEY;

/* =========================================================
   ZONES TARIFAIRES
========================================================= */

function getZoneFromPostcode(postcode) {
  if (!postcode) {
    return null;
  }

  const cp = String(postcode).trim();

  if (/^750\d{2}$/.test(cp)) {
    return "paris";
  }

  if (/^(92|93|94)\d{3}$/.test(cp)) {
    return "petite_couronne";
  }

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
  if (
    !zoneDepart ||
    !zoneArrivee
  ) {
    return null;
  }

  if (
    zoneDepart === "paris" &&
    zoneArrivee === "paris"
  ) {
    return 89;
  }

  if (
    (zoneDepart === "paris" &&
      zoneArrivee === "petite_couronne") ||
    (zoneDepart === "petite_couronne" &&
      zoneArrivee === "paris")
  ) {
    return 99;
  }

  if (
    zoneDepart === "petite_couronne" &&
    zoneArrivee === "petite_couronne"
  ) {
    return 99;
  }

  if (
    (zoneDepart === "paris" &&
      zoneArrivee === "grande_couronne") ||
    (zoneDepart === "grande_couronne" &&
      zoneArrivee === "paris")
  ) {
    return 129;
  }

  if (
    (zoneDepart === "petite_couronne" &&
      zoneArrivee === "grande_couronne") ||
    (zoneDepart === "grande_couronne" &&
      zoneArrivee === "petite_couronne")
  ) {
    return 119;
  }

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
   NORMALISATION
========================================================= */

function normalizeAddress(text) {
  let value = String(text || "")
    .trim()
    .replace(/\s+/g, " ");

  value = value.replace(
    /^(\d+[A-Za-z]?(?:\s*(?:bis|ter|quater))?(?:\s*[-/]\s*\d+[A-Za-z]?)?)\s*(rue|avenue|av|boulevard|bd|chemin|route|place|impasse|allee|allée|cours|quai|square|passage|voie|résidence|residence)\b/i,
    "$1 $2"
  );

  return value;
}

/* =========================================================
   EXTRACTION NUMÉRO
========================================================= */

function extractHouseNumber(text) {
  const match =
    String(text || "").match(
      /^\s*(\d+(?:[A-Za-z])?(?:\s*(?:bis|ter|quater))?(?:\s*[-/]\s*\d+(?:[A-Za-z])?)?)/i
    );

  return match
    ? match[1].trim()
    : "";
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

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `Geoapify ${response.status}`
    );
  }

  return data;
}

/* =========================================================
   GÉOCODAGE
========================================================= */

async function geocode(address) {
  const normalized =
    normalizeAddress(address);

  const requestedNumber =
    extractHouseNumber(normalized);

  let features = [];

  const searchUrl =
    "https://api.geoapify.com/v1/geocode/search" +
    `?text=${encodeURIComponent(
      normalized
    )}` +
    "&limit=10" +
    "&filter=countrycode:fr" +
    "&lang=fr" +
    `&apiKey=${GEOAPIFY_API_KEY}`;

  const searchData =
    await fetchGeoapify(searchUrl);

  features.push(
    ...(searchData.features || [])
  );

  if (requestedNumber) {
    const preciseUrl =
      "https://api.geoapify.com/v1/geocode/search" +
      `?text=${encodeURIComponent(
        normalized
      )}` +
      `&housenumber=${encodeURIComponent(
        requestedNumber
      )}` +
      "&limit=10" +
      "&filter=countrycode:fr" +
      "&lang=fr" +
      `&apiKey=${GEOAPIFY_API_KEY}`;

    try {
      const preciseData =
        await fetchGeoapify(preciseUrl);

      features.push(
        ...(preciseData.features || [])
      );
    } catch (error) {
      console.warn(
        "Recherche précise :",
        error?.message
      );
    }
  }

  if (features.length === 0) {
    throw new Error(
      `Adresse introuvable : ${address}`
    );
  }

  const unique = new Map();

  for (const feature of features) {
    const properties =
      feature.properties || {};

    const coordinates =
      feature.geometry?.coordinates || [];

    const key =
      properties.place_id ||
      [
        properties.formatted || "",
        coordinates[0] || "",
        coordinates[1] || "",
      ].join("|");

    if (!unique.has(key)) {
      unique.set(
        key,
        feature
      );
    }
  }

  const sorted =
    Array.from(
      unique.values()
    ).sort((a, b) => {
      const aProperties =
        a.properties || {};

      const bProperties =
        b.properties || {};

      const aNumber =
        String(
          aProperties.housenumber ||
            aProperties.house_number ||
            ""
        )
          .trim()
          .toLowerCase();

      const bNumber =
        String(
          bProperties.housenumber ||
            bProperties.house_number ||
            ""
        )
          .trim()
          .toLowerCase();

      const wanted =
        requestedNumber
          .trim()
          .toLowerCase();

      if (wanted) {
        const aExact =
          aNumber === wanted;

        const bExact =
          bNumber === wanted;

        if (aExact !== bExact) {
          return aExact
            ? -1
            : 1;
        }

        if (
          aNumber &&
          !bNumber
        ) {
          return -1;
        }

        if (
          !aNumber &&
          bNumber
        ) {
          return 1;
        }
      }

      const aConfidence =
        Number(
          aProperties.rank
            ?.confidence || 0
        );

      const bConfidence =
        Number(
          bProperties.rank
            ?.confidence || 0
        );

      return (
        bConfidence -
        aConfidence
      );
    });

  const feature =
    sorted[0];

  const properties =
    feature.properties || {};

  const coordinates =
    feature.geometry?.coordinates;

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
      Number(coordinates[1]),

    longitude:
      Number(coordinates[0]),

    formatted:
      properties.formatted ||
      normalized,

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
   COORDONNÉES AUTOCOMPLETE
========================================================= */

function getSelectedGeo(
  selected,
  fallbackAddress
) {
  if (
    selected &&
    Number.isFinite(
      Number(selected.latitude)
    ) &&
    Number.isFinite(
      Number(selected.longitude)
    )
  ) {
    return {
      latitude:
        Number(selected.latitude),

      longitude:
        Number(selected.longitude),

      formatted:
        selected.formatted ||
        fallbackAddress,

      postcode:
        selected.postcode ||
        null,

      city:
        selected.city ||
        null,

      zone:
        getZoneFromPostcode(
          selected.postcode
        ),
    };
  }

  return null;
}

/* =========================================================
   ITINÉRAIRE
========================================================= */

async function calculateRoute(
  depart,
  arrivee
) {
  const waypoints =
    `${depart.latitude},${depart.longitude}|${arrivee.latitude},${arrivee.longitude}`;

  const url =
    "https://api.geoapify.com/v1/routing" +
    `?waypoints=${encodeURIComponent(
      waypoints
    )}` +
    "&mode=drive" +
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
    data.features[0].properties || {};

  const distanceMeters =
    properties.distance ??
    properties.distance_meters ??
    properties.distances?.[0];

  const timeSeconds =
    properties.time ??
    properties.time_seconds ??
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
          Number(distanceMeters) /
          1000
        ).toFixed(1)
      ),

    durationMinutes:
      timeSeconds !== undefined &&
      timeSeconds !== null
        ? Math.round(
            Number(timeSeconds) / 60
          )
        : null,
  };
}

/* =========================================================
   PRIX
========================================================= */

function calculatePrice({
  basePrice,
  distanceKm,
  service,
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

  /* =======================================================
     TYPE DE PRESTATION
  ======================================================= */

  if (service === "urgent") {
    price += 20;

    supplements.push({
      label: "Urgent",
      amount: 20,
    });
  }

  if (service === "express") {
    price += 40;

    supplements.push({
      label:
        "Express / véhicule dédié prioritaire",
      amount: 40,
    });
  }

  /* =======================================================
     MAJORATIONS HORAIRES
  ======================================================= */

  let percentage = 1;

  if (samedi) {
    percentage += 0.1;
  }

  if (nuit) {
    percentage += 0.25;
  }

  if (dimanche) {
    percentage += 0.3;
  }

  const percentageSupplement =
    price * (percentage - 1);

  if (
    percentageSupplement > 0
  ) {
    price +=
      percentageSupplement;

    if (samedi) {
      supplements.push({
        label: "Samedi +10 %",
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
   POST
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
        { status: 500 }
      );
    }

    const body =
      await request.json();

    const {
      depart,
      arrivee,

      departGeo,
      arriveeGeo,

      service = "standard",

      samedi = false,
      nuit = false,
      dimanche = false,
    } = body;

    /* =====================================================
       VALIDATION ADRESSES
    ===================================================== */

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
        { status: 400 }
      );
    }

    /* =====================================================
       VALIDATION SERVICE
    ===================================================== */

    const allowedServices = [
      "standard",
      "urgent",
      "express",
    ];

    if (
      !allowedServices.includes(
        service
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Type de prestation invalide.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       VALIDATION SAMEDI / DIMANCHE
    ===================================================== */

    if (
      samedi &&
      dimanche
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Une course ne peut pas être à la fois prévue le samedi et le dimanche / jour férié.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       ANCIENNE OPTION ATTENTE
       REFUSÉE EXPLICITEMENT
    ===================================================== */

    if (
      body.attente === true
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "L'attente n'est pas une option tarifaire du calculateur. Elle peut faire l'objet d'un ajustement selon les conditions réelles de la mission.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       1. UTILISER LES COORDONNÉES SÉLECTIONNÉES
    ===================================================== */

    const selectedDepart =
      getSelectedGeo(
        departGeo,
        depart
      );

    const selectedArrivee =
      getSelectedGeo(
        arriveeGeo,
        arrivee
      );

    const departResolved =
      selectedDepart ||
      (await geocode(depart));

    const arriveeResolved =
      selectedArrivee ||
      (await geocode(arrivee));

    /* =====================================================
       2. ZONES
    ===================================================== */

    if (
      !departResolved.zone ||
      !arriveeResolved.zone
    ) {
      return NextResponse.json({
        success: false,

        reason:
          "hors_zone",

        message:
          "Cette adresse est en dehors de la zone tarifaire automatique. Demandez un devis personnalisé.",

        depart:
          departResolved,

        arrivee:
          arriveeResolved,
      });
    }

    /* =====================================================
       3. ITINÉRAIRE
    ===================================================== */

    const route =
      await calculateRoute(
        departResolved,
        arriveeResolved
      );

    /* =====================================================
       4. TARIF DE BASE
    ===================================================== */

    const basePrice =
      getBasePrice(
        departResolved.zone,
        arriveeResolved.zone
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

    /* =====================================================
       5. CALCUL
    ===================================================== */

    const calculation =
      calculatePrice({
        basePrice,

        distanceKm:
          route.distanceKm,

        service,

        samedi,
        nuit,
        dimanche,
      });

    /* =====================================================
       6. RÉPONSE
    ===================================================== */

    return NextResponse.json({
      success: true,

      vehicle:
        "20 m³ avec chauffeur",

      depart: {
        adresse:
          departResolved.formatted,

        ville:
          departResolved.city,

        codePostal:
          departResolved.postcode,

        zone:
          getZoneLabel(
            departResolved.zone
          ),
      },

      arrivee: {
        adresse:
          arriveeResolved.formatted,

        ville:
          arriveeResolved.city,

        codePostal:
          arriveeResolved.postcode,

        zone:
          getZoneLabel(
            arriveeResolved.zone
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

        attente:
          "Selon les conditions réelles de la mission",
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
          error?.message ||
          "Une erreur est survenue pendant le calcul.",
      },
      { status: 500 }
    );
  }
}