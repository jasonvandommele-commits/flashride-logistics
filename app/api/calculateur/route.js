import { NextResponse } from "next/server";

const GEOAPIFY_API_KEY =
  process.env.GEOAPIFY_API_KEY;

/* =========================================================
   ZONES TARIFAIRES IDF
========================================================= */

function getZoneFromPostcode(postcode) {
  if (!postcode) return null;

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
      return "Hors Île-de-France";
  }
}

/* =========================================================
   TARIFS DE BASE PAR VÉHICULE
========================================================= */

const VEHICLE_PRICES = {
  moto: {
    paris_paris: 20,
    paris_petite: 25,
    petite_petite: 25,
    paris_grande: 32,
    petite_grande: 30,
    grande_grande: 35,
  },

  voiture: {
    paris_paris: 29,
    paris_petite: 35,
    petite_petite: 35,
    paris_grande: 45,
    petite_grande: 42,
    grande_grande: 49,
  },

  fourgon: {
    paris_paris: 39,
    paris_petite: 45,
    petite_petite: 45,
    paris_grande: 55,
    petite_grande: 52,
    grande_grande: 59,
  },

  "20m3": {
    paris_paris: 89,
    paris_petite: 99,
    petite_petite: 99,
    paris_grande: 129,
    petite_grande: 119,
    grande_grande: 129,
  },
};

/* =========================================================
   SUPPLÉMENTS DISTANCE PAR VÉHICULE
========================================================= */

const DISTANCE_SUPPLEMENTS = {
  moto: [
    [10, 0],
    [20, 5],
    [30, 10],
    [40, 15],
    [50, 20],
    [75, 25],
    [100, 35],
  ],

  voiture: [
    [10, 0],
    [20, 5],
    [30, 10],
    [40, 15],
    [50, 20],
    [75, 30],
    [100, 40],
  ],

  fourgon: [
    [10, 0],
    [20, 7],
    [30, 12],
    [40, 18],
    [50, 24],
    [75, 32],
    [100, 42],
  ],

  "20m3": [
    [10, 0],
    [20, 10],
    [30, 15],
    [40, 20],
    [50, 25],
    [75, 35],
    [100, 50],
  ],
};

function getDistanceSupplement(
  vehicle,
  distanceKm
) {
  const table =
    DISTANCE_SUPPLEMENTS[vehicle];

  if (!table) return 0;

  for (const [limit, price] of table) {
    if (distanceKm <= limit) {
      return price;
    }
  }

  return table[table.length - 1][1];
}

/* =========================================================
   SUPPLÉMENTS OPTIONS PAR VÉHICULE
========================================================= */

const OPTION_SUPPLEMENTS = {
  moto: {
    urgent: 10,
    express: 20,
  },

  voiture: {
    urgent: 15,
    express: 30,
  },

  fourgon: {
    urgent: 20,
    express: 35,
  },

  "20m3": {
    urgent: 25,
    express: 45,
  },
};

/* =========================================================
   MAJORATIONS
========================================================= */

const VEHICLE_PERCENTAGES = {
  moto: {
    nuit: 0.20,
    samedi: 0.10,
    dimanche: 0.25,
  },

  voiture: {
    nuit: 0.20,
    samedi: 0.10,
    dimanche: 0.25,
  },

  fourgon: {
    nuit: 0.25,
    samedi: 0.10,
    dimanche: 0.30,
  },

  "20m3": {
    nuit: 0.25,
    samedi: 0.10,
    dimanche: 0.30,
  },
};

/* =========================================================
   NOM DES VÉHICULES
========================================================= */

const VEHICLE_NAMES = {
  moto: "Moto",
  voiture: "Voiture 3 m³",
  fourgon: "Fourgon 8 m³",
  "20m3": "Utilitaire 20 m³",
};

/* =========================================================
   TARIF DE BASE SELON LES ZONES
========================================================= */

function getZoneCombination(
  zoneDepart,
  zoneArrivee
) {
  if (
    zoneDepart === "paris" &&
    zoneArrivee === "paris"
  ) {
    return "paris_paris";
  }

  if (
    (zoneDepart === "paris" &&
      zoneArrivee === "petite_couronne") ||
    (zoneDepart === "petite_couronne" &&
      zoneArrivee === "paris")
  ) {
    return "paris_petite";
  }

  if (
    zoneDepart === "petite_couronne" &&
    zoneArrivee === "petite_couronne"
  ) {
    return "petite_petite";
  }

  if (
    (zoneDepart === "paris" &&
      zoneArrivee === "grande_couronne") ||
    (zoneDepart === "grande_couronne" &&
      zoneArrivee === "paris")
  ) {
    return "paris_grande";
  }

  if (
    (zoneDepart === "petite_couronne" &&
      zoneArrivee === "grande_couronne") ||
    (zoneDepart === "grande_couronne" &&
      zoneArrivee === "petite_couronne")
  ) {
    return "petite_grande";
  }

  if (
    zoneDepart === "grande_couronne" &&
    zoneArrivee === "grande_couronne"
  ) {
    return "grande_grande";
  }

  return null;
}

function getBasePrice(
  vehicle,
  zoneDepart,
  zoneArrivee
) {
  const combination =
    getZoneCombination(
      zoneDepart,
      zoneArrivee
    );

  if (!combination) {
    return null;
  }

  return (
    VEHICLE_PRICES[vehicle]?.[
      combination
    ] ?? null
  );
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
    `?text=${encodeURIComponent(normalized)}` +
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
      `?text=${encodeURIComponent(normalized)}` +
      `&housenumber=${encodeURIComponent(requestedNumber)}` +
      "&limit=10" +
      "&filter=countrycode:fr" +
      "&lang=fr" +
      `&apiKey=${GEOAPIFY_API_KEY}`;

    try {
      const preciseData =
        await fetchGeoapify(
          preciseUrl
        );

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

  const feature = sorted[0];

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
    data.features[0]
      .properties || {};

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
            Number(timeSeconds) /
              60
          )
        : null,
  };
}

/* =========================================================
   CALCUL DU PRIX
========================================================= */

function calculatePrice({
  vehicle,
  basePrice,
  distanceKm,
  priorite,
  samedi,
  nuit,
  dimanche,
}) {
  const distanceSupplement =
    getDistanceSupplement(
      vehicle,
      distanceKm
    );

  let price =
    basePrice +
    distanceSupplement;

  const supplements = [];

  const options =
    OPTION_SUPPLEMENTS[vehicle];

  /* =====================================================
     PRIORITÉ
  ===================================================== */

  if (priorite === "urgent") {
    price += options.urgent;

    supplements.push({
      label:
        "Urgence — Départ prioritaire",
      amount:
        options.urgent,
    });
  }

  if (priorite === "express") {
    price += options.express;

    supplements.push({
      label:
        "Course dédiée — Véhicule exclusivement dédié à votre mission",
      amount:
        options.express,
    });
  }

  /* =====================================================
     MAJORATIONS
     ORDRE : NUIT → SAMEDI → DIMANCHE / JOUR FÉRIÉ
  ===================================================== */

  const percentages =
    VEHICLE_PERCENTAGES[vehicle];

  /* -----------------------------------------------------
     NUIT
  ----------------------------------------------------- */

  if (nuit) {
    const amount =
      Math.round(
        price *
          percentages.nuit
      );

    price += amount;

    supplements.push({
      label:
        `Nuit 22h–6h +${Math.round(
          percentages.nuit * 100
        )} %`,
      amount,
    });
  }

  /* -----------------------------------------------------
     SAMEDI
  ----------------------------------------------------- */

  if (samedi) {
    const amount =
      Math.round(
        price *
          percentages.samedi
      );

    price += amount;

    supplements.push({
      label:
        "Samedi +10 %",
      amount,
    });
  }

  /* -----------------------------------------------------
     DIMANCHE / JOUR FÉRIÉ
  ----------------------------------------------------- */

  if (dimanche) {
    const amount =
      Math.round(
        price *
          percentages.dimanche
      );

    price += amount;

    supplements.push({
      label:
        `Dimanche / jour férié +${Math.round(
          percentages.dimanche * 100
        )} %`,
      amount,
    });
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

      vehicule = "20m3",

      priorite = "standard",

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
        { status: 400 }
      );
    }

    if (
      !VEHICLE_PRICES[vehicule]
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Type de véhicule invalide.",
        },
        { status: 400 }
      );
    }

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
       HORS IDF = SUR DEVIS
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
          "Ce trajet sort de la zone tarifaire automatique. Demandez un devis personnalisé.",

        vehicle:
          VEHICLE_NAMES[vehicule],

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

        trajet: null,
        tarif: null,
        supplements: [],
      });
    }

    /* =====================================================
       CALCUL ITINÉRAIRE
    ===================================================== */

    const route =
      await calculateRoute(
        departResolved,
        arriveeResolved
      );

    /* =====================================================
       TARIF DE BASE
    ===================================================== */

    const basePrice =
      getBasePrice(
        vehicule,
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
       CALCUL PRIX FINAL
    ===================================================== */

    const calculation =
      calculatePrice({
        vehicle:
          vehicule,

        basePrice,

        distanceKm:
          route.distanceKm,

        priorite,

        samedi,

        nuit,

        dimanche,
      });

    /* =====================================================
       RÉPONSE
    ===================================================== */

    return NextResponse.json({
      success: true,

      vehicle:
        VEHICLE_NAMES[vehicule],

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
        manutention:
          "30 min d'attente incluses. Au-delà, l'attente supplémentaire est facturée selon le véhicule. Manutention sur devis.",
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