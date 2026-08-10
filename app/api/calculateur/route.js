import { NextResponse } from "next/server";

const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "API calculateur Flashride opérationnelle",
    geoapifyConfigured: !!GEOAPIFY_API_KEY,
  });
}
export async function POST(request) {
  try {
    if (!GEOAPIFY_API_KEY) {
      return NextResponse.json(
        { error: "Clé Geoapify non configurée." },
        { status: 500 }
      );
    }

    const body = await request.json();

    const {
      depart,
      arrivee,
      urgent = false,
      express = false,
      attente = 0,
      samedi = false,
      nuit = false,
      dimanche = false,
    } = body;

    if (!depart || !arrivee) {
      return NextResponse.json(
        { error: "Adresse de départ et d'arrivée obligatoires." },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------
    // 1. GÉOCODAGE DU DÉPART
    // ---------------------------------------------------------

    const departUrl =
      `https://api.geoapify.com/v1/geocode/search?` +
      `text=${encodeURIComponent(depart)}` +
      `&filter=countrycode:fr` +
      `&limit=1` +
      `&apiKey=${GEOAPIFY_API_KEY}`;

    const departResponse = await fetch(departUrl);

    if (!departResponse.ok) {
      throw new Error("Erreur lors du géocodage du départ.");
    }

    const departData = await departResponse.json();

    if (!departData.features?.length) {
      return NextResponse.json(
        { error: "Adresse de départ introuvable." },
        { status: 400 }
      );
    }

    const departFeature = departData.features[0];
    const [departLon, departLat] = departFeature.geometry.coordinates;

    // ---------------------------------------------------------
    // 2. GÉOCODAGE DE L'ARRIVÉE
    // ---------------------------------------------------------

    const arriveeUrl =
      `https://api.geoapify.com/v1/geocode/search?` +
      `text=${encodeURIComponent(arrivee)}` +
      `&filter=countrycode:fr` +
      `&limit=1` +
      `&apiKey=${GEOAPIFY_API_KEY}`;

    const arriveeResponse = await fetch(arriveeUrl);

    if (!arriveeResponse.ok) {
      throw new Error("Erreur lors du géocodage de l'arrivée.");
    }

    const arriveeData = await arriveeResponse.json();

    if (!arriveeData.features?.length) {
      return NextResponse.json(
        { error: "Adresse d'arrivée introuvable." },
        { status: 400 }
      );
    }

    const arriveeFeature = arriveeData.features[0];
    const [arriveeLon, arriveeLat] =
      arriveeFeature.geometry.coordinates;

    // ---------------------------------------------------------
    // 3. CALCUL DE L'ITINÉRAIRE
    // ---------------------------------------------------------

    const routingUrl =
      `https://api.geoapify.com/v1/routing?` +
      `waypoints=${departLat},${departLon}|${arriveeLat},${arriveeLon}` +
      `&mode=drive` +
      `&apiKey=${GEOAPIFY_API_KEY}`;

    const routingResponse = await fetch(routingUrl);

    if (!routingResponse.ok) {
      throw new Error("Erreur lors du calcul de l'itinéraire.");
    }

    const routingData = await routingResponse.json();

    const route = routingData.features?.[0];

    if (!route) {
      return NextResponse.json(
        { error: "Impossible de calculer l'itinéraire." },
        { status: 400 }
      );
    }

    const distanceMeters = route.properties.distance;
    const durationSeconds = route.properties.time;

    const distanceKm = distanceMeters / 1000;

    // ---------------------------------------------------------
    // 4. VÉRIFICATION ÎLE-DE-FRANCE
    // ---------------------------------------------------------

    const departCity =
      departFeature.properties.city ||
      departFeature.properties.county ||
      "";

    const arriveeCity =
      arriveeFeature.properties.city ||
      arriveeFeature.properties.county ||
      "";

    const departPostcode =
      departFeature.properties.postcode || "";

    const arriveePostcode =
      arriveeFeature.properties.postcode || "";

    const isParis = (postcode) =>
      /^750\d\d$/.test(postcode);

    const isPetiteCouronne = (postcode) =>
      /^(92|93|94)\d{3}$/.test(postcode);

    const isGrandeCouronne = (postcode) =>
      /^(77|78|91|95)\d{3}$/.test(postcode);

    const getZone = (postcode) => {
      if (isParis(postcode)) return "paris";
      if (isPetiteCouronne(postcode)) return "petite";
      if (isGrandeCouronne(postcode)) return "grande";
      return "hors_idf";
    };

    const zoneDepart = getZone(departPostcode);
    const zoneArrivee = getZone(arriveePostcode);

    if (
      zoneDepart === "hors_idf" ||
      zoneArrivee === "hors_idf"
    ) {
      return NextResponse.json({
        success: true,
        eligible: false,
        message:
          "Ce trajet nécessite une étude personnalisée.",
        distanceKm: Number(distanceKm.toFixed(1)),
        durationMinutes: Math.round(durationSeconds / 60),
      });
    }

    // ---------------------------------------------------------
    // 5. TARIF DE BASE
    // ---------------------------------------------------------

    let basePrice = 0;

    if (
      zoneDepart === "paris" &&
      zoneArrivee === "paris"
    ) {
      basePrice = 89;
    } else if (
      zoneDepart === "petite" &&
      zoneArrivee === "petite"
    ) {
      basePrice = 99;
    } else if (
      (zoneDepart === "paris" &&
        zoneArrivee === "petite") ||
      (zoneDepart === "petite" &&
        zoneArrivee === "paris")
    ) {
      basePrice = 99;
    } else if (
      (zoneDepart === "paris" &&
        zoneArrivee === "grande") ||
      (zoneDepart === "grande" &&
        zoneArrivee === "paris")
    ) {
      basePrice = 129;
    } else if (
      (zoneDepart === "petite" &&
        zoneArrivee === "grande") ||
      (zoneDepart === "grande" &&
        zoneArrivee === "petite")
    ) {
      basePrice = 119;
    } else if (
      zoneDepart === "grande" &&
      zoneArrivee === "grande"
    ) {
      basePrice = 129;
    }

    // ---------------------------------------------------------
    // 6. SUPPLÉMENT DISTANCE
    // ---------------------------------------------------------

    let distanceSupplement = 0;

    if (distanceKm > 10 && distanceKm <= 20) {
      distanceSupplement = 10;
    } else if (distanceKm > 20 && distanceKm <= 30) {
      distanceSupplement = 15;
    } else if (distanceKm > 30 && distanceKm <= 40) {
      distanceSupplement = 20;
    } else if (distanceKm > 40 && distanceKm <= 50) {
      distanceSupplement = 25;
    } else if (distanceKm > 50 && distanceKm <= 75) {
      distanceSupplement = 35;
    } else if (distanceKm > 75 && distanceKm <= 100) {
      distanceSupplement = 50;
    } else if (distanceKm > 100) {
      return NextResponse.json({
        success: true,
        eligible: false,
        message:
          "Ce trajet nécessite une étude personnalisée.",
        distanceKm: Number(distanceKm.toFixed(1)),
        durationMinutes: Math.round(durationSeconds / 60),
      });
    }

    // ---------------------------------------------------------
    // 7. SUPPLÉMENTS
    // ---------------------------------------------------------

    let price = basePrice + distanceSupplement;

    if (urgent) {
      price += 20;
    }

    if (express) {
      price += 40;
    }

    if (attente > 0) {
      price += Math.ceil(Number(attente) / 30) * 30;
    }

    // Majorations
    let multiplier = 1;

    if (samedi) {
      multiplier *= 1.10;
    }

    if (nuit) {
      multiplier *= 1.25;
    }

    if (dimanche) {
      multiplier *= 1.30;
    }

    price *= multiplier;

    price = Math.ceil(price);

    // ---------------------------------------------------------
    // 8. RÉPONSE
    // ---------------------------------------------------------

    return NextResponse.json({
      success: true,
      eligible: true,
      vehicle: "20m3",
      distanceKm: Number(distanceKm.toFixed(1)),
      durationMinutes: Math.round(durationSeconds / 60),
      zoneDepart,
      zoneArrivee,
      basePrice,
      distanceSupplement,
      priceHT: price,
      message: "Estimation calculée avec succès.",
    });
  } catch (error) {
    console.error("Calculateur Flashride:", error);

    return NextResponse.json(
      {
        error:
          "Une erreur est survenue lors du calcul du transport.",
      },
      { status: 500 }
    );
  }
}
