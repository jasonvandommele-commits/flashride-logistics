import { NextResponse } from "next/server";

const GEOAPIFY_API_KEY =
  process.env.GEOAPIFY_API_KEY;

/* =========================================================
   ZONES TARIFAIRES IDF
========================================================= */

function getZoneFromPostcode(postcode) {
  if (!postcode) {
    return null;
  }

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

  // Hors Île-de-France
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
   NORMALISATION VEHICULE
========================================================= */

function normalizeVehicle(vehicle) {
  const value = String(vehicle || "")
    .trim()
    .toLowerCase();

  if (
    value === "moto" ||
    value === "2roues"
  ) {
    return "moto";
  }

  if (
    value === "voiture" ||
    value === "3m3"
  ) {
    return "voiture";
  }

  if (
    value === "fourgon" ||
    value === "8m3"
  ) {
    return "fourgon";
  }

  if (
    value === "20m3" ||
    value === "20 m3"
  ) {
    return "20m3";
  }

  return "20m3";
}

/* =========================================================
   INFORMATIONS VEHICULE
========================================================= */

function getVehicleInfo(vehicle) {
  switch (vehicle) {
    case "moto":
      return {
        name: "Moto",
        volume: "2 roues",
      };

    case "voiture":
      return {
        name: "Voiture",
        volume: "3 m³",
      };

    case "fourgon":
      return {
        name: "Fourgon",
        volume: "8 m³",
      };

    case "20m3":
    default:
      return {
        name: "20 m³",
        volume: "20 m³",
      };
  }
}

/* =========================================================
   TARIFS DE BASE PAR VEHICULE
========================================================= */

const BASE_PRICES = {
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

  /*
   * 20 m³ :
   * grille existante conservée.
   */
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
   CLE TARIFAIRE
========================================================= */

function getZoneKey(
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

/* =========================================================
   TARIF DE BASE
========================================================= */

function getBasePrice(
  vehicle,
  zoneDepart,
  zoneArrivee
) {
  const key =
    getZoneKey(
      zoneDepart,
      zoneArrivee
    );

  if (!key) {
    return null;
  }

  return (
    BASE_PRICES[vehicle]?.[key] ??
    null
  );
}

/* =========================================================
   SUPPLEMENT DISTANCE
========================================================= */

function getDistanceSupplement(
  distanceKm
) {
  if (distanceKm <= 10) {
    return 0;
  }

  if (distanceKm <= 20) {
    return 5;
  }

  if (distanceKm <= 30) {
    return 10;
  }

  if (distanceKm <= 40) {
    return 15;
  }

  if (distanceKm <= 50) {
    return 20;
  }

  if (distanceKm <= 75) {
    return 30;
  }

  if (distanceKm <= 100) {
    return 40;
  }

  /*
   * Au-delà de 100 km :
   * toujours en IDF = on conserve le plafond.
   */
  return 40;
}

/* =========================================================
   SUPPLEMENT DISTANCE PAR VEHICULE
========================================================= */

function getVehicleDistanceSupplement(
  vehicle,
  distanceKm
) {
  /*
   * Moto / voiture
   * Fourgon
   * 20 m³
   *
   * Les grilles sont volontairement séparées
   * afin de pouvoir les modifier indépendamment.
   */

  const tables = {
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

  const table =
    tables[vehicle] ||
    tables["20m3"];

  for (const [limit, supplement] of table) {
    if (distanceKm <= limit) {
      return supplement;
    }
  }

  return table[table.length - 1][1];
}

/* =========================================================
   MAJORATIONS PAR VEHICULE
========================================================= */

function getVehicleSurcharges(
  vehicle
) {
  const surcharges = {
    moto: {
      urgent: 10,
      express: 20,
      nuit: 0.20,
      samedi: 0.10,
      dimanche: 0.25,
    },

    voiture: {
      urgent: 15,
      express: 30,
      nuit: 0.20,
      samedi: 0.10,
      dimanche: 0.25,
    },

    fourgon: {
      urgent: 20,
      express: 35,
      nuit: 0.25,
      samedi: 0.10,
      dimanche: 0.30,
    },

    "20m3": {
      urgent: 25,
      express: 45,
      nuit: 0.25,
      samedi: 0.10,
      dimanche: 0.30,
    },
  };

  return (
    surcharges[vehicle] ||
    surcharges["20m3"]
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
   EXTRACTION NUMERO
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
   GEOCODAGE
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
    await fetchGeoapify(
      searchUrl
    );

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
      feature.geometry
        ?.coordinates || [];

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
    ).sort(
      (a, b) => {
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

          if (
            aExact !== bExact
          ) {
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
      }
    );

  const feature =
    sorted[0];

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
   COORDONNEES AUTOCOMPLETE
========================================================= */

function getSelectedGeo(
  selected,
  fallbackAddress
) {
  if (
    selected &&
    Number.isFinite(
      Number(
        selected.latitude
      )
    ) &&
    Number.isFinite(
      Number(
        selected.longitude
      )
    )
  ) {
    return {
      latitude:
        Number(
          selected.latitude
        ),

      longitude:
        Number(
          selected.longitude
        ),

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
   ITINERAIRE
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
    distanceMeters ===
      undefined ||
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
      timeSeconds !==
        undefined &&
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
  attente,
  samedi,
  nuit,
  dimanche,
}) {
  const vehicleSurcharges =
    getVehicleSurcharges(
      vehicle
    );

  const distanceSupplement =
    getVehicleDistanceSupplement(
      vehicle,
      distanceKm
    );

  let price =
    basePrice +
    distanceSupplement;

  const supplements = [];

  /* =======================================================
     PRIORITE
  ======================================================= */

  if (
    priorite === "urgent"
  ) {
    price +=
      vehicleSurcharges.urgent;

    supplements.push({
      label: "Urgent",
      amount:
        vehicleSurcharges.urgent,
    });
  }

  if (
    priorite === "express"
  ) {
    price +=
      vehicleSurcharges.express;

    supplements.push({
      label:
        "Express / véhicule dédié prioritaire",
      amount:
        vehicleSurcharges.express,
    });
  }

  /* =======================================================
     ATTENTE
  ======================================================= */

  if (attente) {
    price += 30;

    supplements.push({
      label: "Attente 30 min",
      amount: 30,
    });
  }

  /* =======================================================
     MAJORATIONS
  ======================================================= */

  let percentage = 0;

  if (samedi) {
    percentage +=
      vehicleSurcharges.samedi;
  }

  if (nuit) {
    percentage +=
      vehicleSurcharges.nuit;
  }

  if (dimanche) {
    percentage +=
      vehicleSurcharges.dimanche;
  }

  if (percentage > 0) {
    const percentageSupplement =
      price * percentage;

    price +=
      percentageSupplement;

    if (samedi) {
      supplements.push({
        label:
          `Samedi +${vehicleSurcharges.samedi * 100} %`,
        amount: null,
      });
    }

    if (nuit) {
      supplements.push({
        label:
          `Nuit 22h–6h +${vehicleSurcharges.nuit * 100} %`,
        amount: null,
      });
    }

    if (dimanche) {
      supplements.push({
        label:
          `Dimanche / jour férié +${vehicleSurcharges.dimanche * 100} %`,
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

      departGeo,
      arriveeGeo,

      vehicle = "20m3",

      priorite = "standard",

      attente = false,
      samedi = false,
      nuit = false,
      dimanche = false,
    } = body;

    /* =====================================================
       VALIDATION
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
        {
          status: 400,
        }
      );
    }

    const selectedVehicle =
      normalizeVehicle(vehicle);

    const vehicleInfo =
      getVehicleInfo(
        selectedVehicle
      );

    /* =====================================================
       GEOCODAGE
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
          vehicleInfo.name,

        volume:
          vehicleInfo.volume,

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

        fraisSupplementaires: {
          peages:
            "À déterminer sur devis",

          manutention:
            "Sur devis",
        },
      });
    }

    /* =====================================================
       ITINERAIRE
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
        selectedVehicle,
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

        depart:
          departResolved,

        arrivee:
          arriveeResolved,

        trajet:
          route,
      });
    }

    /* =====================================================
       CALCUL
    ===================================================== */

    const calculation =
      calculatePrice({
        vehicle:
          selectedVehicle,

        basePrice,

        distanceKm:
          route.distanceKm,

        priorite,

        attente,

        samedi,

        nuit,

        dimanche,
      });

    /* =====================================================
       REPONSE
    ===================================================== */

    return NextResponse.json({
      success: true,

      vehicle:
        vehicleInfo.name,

      volume:
        vehicleInfo.volume,

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
      {
        status: 500,
      }
    );
  }
}