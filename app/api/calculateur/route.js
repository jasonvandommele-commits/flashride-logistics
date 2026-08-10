import { NextResponse } from "next/server";

const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;

function getZoneFromPostcode(postcode) {
  if (!postcode) return null;

  const cp = String(postcode).trim();

  // Paris
  if (/^750\d{2}$/.test(cp)) {
    return "paris";
  }

  // Petite couronne : 92 / 93 / 94
  if (/^(92|93|94)\d{3}$/.test(cp)) {
    return "petite_couronne";
  }

  // Grande couronne : 77 / 78 / 91 / 95
  if (/^(77|78|91|95)\d{3}$/.test(cp)) {
    return "grande_couronne";
  }

  return null;
}

function getBasePrice(zoneDepart, zoneArrivee) {
  if (!zoneDepart || !zoneArrivee) {
    return null;
  }

  // Paris → Paris
  if (zoneDepart === "paris" && zoneArrivee === "paris") {
    return 89;
  }

  // Paris ↔ Petite couronne
  if (
    (zoneDepart === "paris" && zoneArrivee === "petite_couronne") ||
    (zoneDepart === "petite_couronne" && zoneArrivee === "paris")
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
    (zoneDepart === "paris" && zoneArrivee === "grande_couronne") ||
    (zoneDepart === "grande_couronne" && zoneArrivee === "paris")
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

function getDistanceSupplement(distanceKm) {
  if (distanceKm <= 10) return 0;
  if (distanceKm <= 20) return 10;
  if (distanceKm <= 30) return 15;
  if (distanceKm <= 40) return 20;
  if (distanceKm <= 50) return 25;
  if (distanceKm <= 75) return 35;
  if (distanceKm <= 100) return 50;

  // Au-delà de 100 km :
  // on conserve +50 € et on indique que le trajet doit être vérifié.
  return 50;
}

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

async function geocode(address) {
  const url =
    `https://api.geoapify.com/v1/geocode/search` +
    `?text=${encodeURIComponent(address)}` +
    `&limit=1` +
    `&filter=countrycode:fr` +
    `&apiKey=${GEOAPIFY_API_KEY}`;

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Erreur Geoapify geocoding : ${response.status}`);
  }

  const data = await response.json();

  if (!data.features || data.features.length === 0) {
    throw new Error(`Adresse introuvable : ${address}`);
  }

  const properties = data.features[0].properties;
  const coordinates = data.features[0].geometry.coordinates;

  return {
    latitude: coordinates[1],
    longitude: coordinates[0],
    formatted: properties.formatted || address,
    postcode: properties.postcode || null,
    city: properties.city || properties.town || properties.village || null,
    zone: getZoneFromPostcode(properties.postcode),
  };
}

async function calculateRoute(depart, arrivee) {
  const url =
    `https://api.geoapify.com/v1/routing` +
    `?waypoints=${depart.latitude},${depart.longitude}|${arrivee.latitude},${arrivee.longitude}` +
    `&mode=drive` +
    `&apiKey=${GEOAPIFY_API_KEY}`;

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Erreur Geoapify routing : ${response.status}`);
  }

  const data = await response.json();

  if (!data.features || data.features.length === 0) {
    throw new Error("Impossible de calculer l'itinéraire.");
  }

  const properties = data.features[0].properties;

  const distanceMeters =
    properties.distance ||
    properties.distance_meters ||
    properties.distances?.[0];

  const timeSeconds =
    properties.time ||
    properties.time_seconds ||
    properties.duration;

  if (!distanceMeters) {
    throw new Error("Distance non disponible.");
  }

  return {
    distanceKm: Number((distanceMeters / 1000).toFixed(1)),
    durationMinutes: timeSeconds
      ? Math.round(timeSeconds / 60)
      : null,
  };
}

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
  const distanceSupplement = getDistanceSupplement(distanceKm);

  let price = basePrice + distanceSupplement;

  const supplements = [];

  if (urgent) {
    price += 20;
    supplements.push({
      label: "Urgent",
      amount: 20,
    });
  }

  if (express) {
    price += 40;
    supplements.push({
      label: "Express / véhicule dédié prioritaire",
      amount: 40,
    });
  }

  if (attente) {
    price += 30;
    supplements.push({
      label: "Attente 30 min",
      amount: 30,
    });
  }

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

  const percentageSupplement = price * (percentage - 1);

  if (percentageSupplement > 0) {
    price += percentageSupplement;

    if (samedi) {
      supplements.push({
        label: "Samedi +10 %",
        amount: null,
      });
    }

    if (nuit) {
      supplements.push({
        label: "Nuit 22h–6h +25 %",
        amount: null,
      });
    }

    if (dimanche) {
      supplements.push({
        label: "Dimanche / jour férié +30 %",
        amount: null,
      });
    }
  }

  return {
    totalHT: Math.round(price),
    distanceSupplement,
    supplements,
  };
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Calculateur Flashride opérationnel",
    geoapifyConfigured: Boolean(GEOAPIFY_API_KEY),
  });
}

export async function POST(request) {
  try {
    if (!GEOAPIFY_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "GEOAPIFY_API_KEY non configurée.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

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

    if (!depart || !arrivee) {
      return NextResponse.json(
        {
          success: false,
          error: "Les adresses de départ et d'arrivée sont obligatoires.",
        },
        { status: 400 }
      );
    }

    // 1. Géocodage
    const departGeo = await geocode(depart);
    const arriveeGeo = await geocode(arrivee);

    // 2. Vérification des zones
    if (!departGeo.zone || !arriveeGeo.zone) {
      return NextResponse.json({
        success: false,
        reason: "hors_zone",
        message:
          "Cette adresse est en dehors de la zone tarifaire automatique. Demandez un devis personnalisé.",
        depart: departGeo,
        arrivee: arriveeGeo,
      });
    }

    // 3. Calcul de l'itinéraire
    const route = await calculateRoute(
      departGeo,
      arriveeGeo
    );

    // 4. Tarif de base
    const basePrice = getBasePrice(
      departGeo.zone,
      arriveeGeo.zone
    );

    if (basePrice === null) {
      return NextResponse.json({
        success: false,
        reason: "tarif_non_disponible",
        message:
          "Ce trajet nécessite une étude personnalisée.",
      });
    }

    // 5. Calcul final
    const calculation = calculatePrice({
      basePrice,
      distanceKm: route.distanceKm,
      urgent,
      express,
      attente,
      samedi,
      nuit,
      dimanche,
    });

    return NextResponse.json({
      success: true,

      vehicle: "20 m³ avec chauffeur",

      depart: {
        adresse: departGeo.formatted,
        ville: departGeo.city,
        codePostal: departGeo.postcode,
        zone: getZoneLabel(departGeo.zone),
      },

      arrivee: {
        adresse: arriveeGeo.formatted,
        ville: arriveeGeo.city,
        codePostal: arriveeGeo.postcode,
        zone: getZoneLabel(arriveeGeo.zone),
      },

      trajet: {
        distanceKm: route.distanceKm,
        dureeMinutes: route.durationMinutes,
      },

      tarif: {
        baseHT: basePrice,
        supplementDistanceHT:
          calculation.distanceSupplement,
        totalHT: calculation.totalHT,
      },

      supplements: calculation.supplements,

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
    console.error("Calculateur Flashride:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          "Une erreur est survenue pendant le calcul.",
      },
      { status: 500 }
    );
  }
}