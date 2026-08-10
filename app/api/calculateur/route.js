import { NextResponse } from "next/server";

const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;

// =========================================================
// TEST GET — Paris → Lille
// =========================================================

export async function GET() {
  try {
    if (!GEOAPIFY_API_KEY) {
      return NextResponse.json(
        { error: "Clé Geoapify non configurée." },
        { status: 500 }
      );
    }

    const depart = "Paris, France";
    const arrivee = "Lille, France";

    // -----------------------------------------------------
    // 1. Géocodage du départ
    // -----------------------------------------------------

    const departResponse = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
        depart
      )}&filter=countrycode:fr&limit=1&apiKey=${GEOAPIFY_API_KEY}`
    );

    if (!departResponse.ok) {
      throw new Error("Erreur lors du géocodage de Paris.");
    }

    const departData = await departResponse.json();

    if (!departData.features?.length) {
      return NextResponse.json(
        { error: "Paris introuvable." },
        { status: 400 }
      );
    }

    const [departLon, departLat] =
      departData.features[0].geometry.coordinates;

    // -----------------------------------------------------
    // 2. Géocodage de l'arrivée
    // -----------------------------------------------------

    const arriveeResponse = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
        arrivee
      )}&filter=countrycode:fr&limit=1&apiKey=${GEOAPIFY_API_KEY}`
    );

    if (!arriveeResponse.ok) {
      throw new Error("Erreur lors du géocodage de Lille.");
    }

    const arriveeData = await arriveeResponse.json();

    if (!arriveeData.features?.length) {
      return NextResponse.json(
        { error: "Lille introuvable." },
        { status: 400 }
      );
    }

    const [arriveeLon, arriveeLat] =
      arriveeData.features[0].geometry.coordinates;

    // -----------------------------------------------------
    // 3. Calcul de l'itinéraire
    // -----------------------------------------------------

    const routingResponse = await fetch(
      `https://api.geoapify.com/v1/routing?waypoints=${departLat},${departLon}|${arriveeLat},${arriveeLon}&mode=drive&apiKey=${GEOAPIFY_API_KEY}`
    );

    if (!routingResponse.ok) {
      throw new Error("Erreur lors du calcul de l'itinéraire.");
    }

    const routingData = await routingResponse.json();

    if (!routingData.features?.length) {
      return NextResponse.json(
        {
          error: "Impossible de calculer l'itinéraire.",
          details: routingData,
        },
        { status: 400 }
      );
    }

    const route = routingData.features[0];

    const distanceKm = route.properties.distance / 1000;
    const durationMinutes = route.properties.time / 60;

    // -----------------------------------------------------
    // 4. Résultat
    // -----------------------------------------------------

    return NextResponse.json({
      success: true,
      trajet: "Paris → Lille",
      distanceKm: Number(distanceKm.toFixed(1)),
      dureeMinutes: Math.round(durationMinutes),
    });
  } catch (error) {
    console.error("Erreur calculateur Flashride :", error);

    return NextResponse.json(
      {
        error: "Erreur pendant le test Geoapify.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// =========================================================
// CALCULATEUR POST
// =========================================================

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
        {
          error:
            "Adresse de départ et adresse d'arrivée obligatoires.",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------------------
    // 1. GÉOCODAGE DU DÉPART
    // -----------------------------------------------------

    const departUrl =
      `https://api.geoapify.com/v1/geocode/search?` +
      `text=${encodeURIComponent(depart)}` +
      `&filter=countrycode:fr` +
      `&limit=1` +
      `&apiKey=${GEOAPIFY_API_KEY}`;

    const departResponse = await fetch(departUrl);

    if (!departResponse.ok) {
      throw new Error(
        "Erreur lors du géocodage du départ."
      );
    }

    const departData = await departResponse.json();

    if (!departData.features?.length) {
      return NextResponse.json(
        {
          error:
            "Adresse de départ introuvable.",
        },
        { status: 400 }
      );
    }

    const departFeature = departData.features[0];

    const [departLon, departLat] =
      departFeature.geometry.coordinates;

    // -----------------------------------------------------
    // 2. GÉOCODAGE DE L'ARRIVÉE
    // -----------------------------------------------------

    const arriveeUrl =
      `https://api.geoapify.com/v1/geocode/search?` +
      `text=${encodeURIComponent(arrivee)}` +
      `&filter=countrycode:fr` +
      `&limit=1` +
      `&apiKey=${GEOAPIFY_API_KEY}`;

    const arriveeResponse = await fetch(arriveeUrl);

    if (!arriveeResponse.ok) {
      throw new Error(
        "Erreur lors du géocodage de l'arrivée."
      );
    }

    const arriveeData = await arriveeResponse.json();

    if (!arriveeData.features?.length) {
      return NextResponse.json(
        {
          error:
            "Adresse d'arrivée introuvable.",
        },
        { status: 400 }
      );
    }

    const arriveeFeature = arriveeData.features[0];

    const [arriveeLon, arriveeLat] =
      arriveeFeature.geometry.coordinates;

    // -----------------------------------------------------
    // 3. ROUTING — MODE DRIVE
    // -----------------------------------------------------

    const routingUrl =
      `https://api.geoapify.com/v1/routing?` +
      `waypoints=${departLat},${departLon}|${arriveeLat},${arriveeLon}` +
      `&mode=drive` +
      `&apiKey=${GEOAPIFY_API_KEY}`;

    const routingResponse = await fetch(routingUrl);

    if (!routingResponse.ok) {
      throw new Error(
        "Erreur lors du calcul de l'itinéraire."
      );
    }

    const routingData = await routingResponse.json();

    const route = routingData.features?.[0];

    if (!route) {
      return NextResponse.json(
        {
          error:
            "Impossible de calculer l'itinéraire.",
        },
        { status: 400 }
      );
    }

    const distanceMeters =
      route.properties.distance;

    const durationSeconds =
      route.properties.time;

    const distanceKm =
      distanceMeters / 1000;

    const durationMinutes =
      durationSeconds / 60;

    // -----------------------------------------------------
    // 4. RÉCUPÉRATION DES CODES POSTAUX
    // -----------------------------------------------------

    const departPostcode =
      departFeature.properties.postcode || "";

    const arriveePostcode =
      arriveeFeature.properties.postcode || "";

    // -----------------------------------------------------
    // 5. DÉTERMINATION DE LA ZONE
    // -----------------------------------------------------

    const getZone = (postcode) => {
      if (/^75\d{3}$/.test(postcode)) {
        return "paris";
      }

      if (/^92\d{3}$/.test(postcode)) {
        return "petite";
      }

      if (/^93\d{3}$/.test(postcode)) {
        return "petite";
      }

      if (/^94\d{3}$/.test(postcode)) {
        return "petite";
      }

      if (/^77\d{3}$/.test(postcode)) {
        return "grande";
      }

      if (/^78\d{3}$/.test(postcode)) {
        return "grande";
      }

      if (/^91\d{3}$/.test(postcode)) {
        return "grande";
      }

      if (/^95\d{3}$/.test(postcode)) {
        return "grande";
      }

      return "hors_idf";
    };

    const zoneDepart =
      getZone(departPostcode);

    const zoneArrivee =
      getZone(arriveePostcode);

    // -----------------------------------------------------
    // 6. TRAJETS HORS ÎLE-DE-FRANCE
    // -----------------------------------------------------

    if (
      zoneDepart === "hors_idf" ||
      zoneArrivee === "hors_idf"
    ) {
      return NextResponse.json({
        success: true,
        eligible: false,
        message:
          "Ce trajet nécessite une étude personnalisée.",
        distanceKm: Number(
          distanceKm.toFixed(1)
        ),
        durationMinutes: Math.round(
          durationMinutes
        ),
      });
    }

    // -----------------------------------------------------
    // 7. TARIF DE BASE
    // -----------------------------------------------------

    let basePrice = 0;

    // Paris → Paris
    if (
      zoneDepart === "paris" &&
      zoneArrivee === "paris"
    ) {
      basePrice = 89;
    }

    // Paris ↔ Petite couronne
    else if (
      (zoneDepart === "paris" &&
        zoneArrivee === "petite") ||
      (zoneDepart === "petite" &&
        zoneArrivee === "paris")
    ) {
      basePrice = 99;
    }

    // Petite couronne → Petite couronne
    else if (
      zoneDepart === "petite" &&
      zoneArrivee === "petite"
    ) {
      basePrice = 99;
    }

    // Paris ↔ Grande couronne
    else if (
      (zoneDepart === "paris" &&
        zoneArrivee === "grande") ||
      (zoneDepart === "grande" &&
        zoneArrivee === "paris")
    ) {
      basePrice = 129;
    }

    // Petite ↔ Grande couronne
    else if (
      (zoneDepart === "petite" &&
        zoneArrivee === "grande") ||
      (zoneDepart === "grande" &&
        zoneArrivee === "petite")
    ) {
      basePrice = 119;
    }

    // Grande couronne → Grande couronne
    else if (
      zoneDepart === "grande" &&
      zoneArrivee === "grande"
    ) {
      basePrice = 129;
    }

    // -----------------------------------------------------
    // 8. SUPPLÉMENT DISTANCE
    // -----------------------------------------------------

    let distanceSupplement = 0;

    if (
      distanceKm > 10 &&
      distanceKm <= 20
    ) {
      distanceSupplement = 10;
    }

    else if (
      distanceKm > 20 &&
      distanceKm <= 30
    ) {
      distanceSupplement = 15;
    }

    else if (
      distanceKm > 30 &&
      distanceKm <= 40
    ) {
      distanceSupplement = 20;
    }

    else if (
      distanceKm > 40 &&
      distanceKm <= 50
    ) {
      distanceSupplement = 25;
    }

    else if (
      distanceKm > 50 &&
      distanceKm <= 75
    ) {
      distanceSupplement = 35;
    }

    else if (
      distanceKm > 75 &&
      distanceKm <= 100
    ) {
      distanceSupplement = 50;
    }

    // Au-delà de 100 km → devis
    else if (distanceKm > 100) {
      return NextResponse.json({
        success: true,
        eligible: false,
        message:
          "Ce trajet nécessite une étude personnalisée.",
        distanceKm: Number(
          distanceKm.toFixed(1)
        ),
        durationMinutes: Math.round(
          durationMinutes
        ),
      });
    }

    // -----------------------------------------------------
    // 9. SUPPLÉMENTS
    // -----------------------------------------------------

    let price =
      basePrice +
      distanceSupplement;

    if (urgent) {
      price += 20;
    }

    if (express) {
      price += 40;
    }

    if (attente > 0) {
      price +=
        Math.ceil(
          Number(attente) / 30
        ) * 30;
    }

    // -----------------------------------------------------
    // 10. MAJORATIONS HORAIRES
    // -----------------------------------------------------

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

    // -----------------------------------------------------
    // 11. RÉSULTAT FINAL
    // -----------------------------------------------------

    return NextResponse.json({
      success: true,
      eligible: true,

      vehicle: "20m3",

      distanceKm: Number(
        distanceKm.toFixed(1)
      ),

      durationMinutes: Math.round(
        durationMinutes
      ),

      zoneDepart,
      zoneArrivee,

      basePrice,
      distanceSupplement,

      priceHT: price,

      message:
        "Estimation calculée avec succès.",
    });
  } catch (error) {
    console.error(
      "Calculateur Flashride :",
      error
    );

    return NextResponse.json(
      {
        error:
          "Une erreur est survenue lors du calcul du transport.",
      },
      { status: 500 }
    );
  }
}