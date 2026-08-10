import { NextResponse } from "next/server";

const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;

export async function GET() {
  try {
    if (!GEOAPIFY_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "GEOAPIFY_API_KEY absente de Vercel",
        },
        { status: 500 }
      );
    }

    // =========================
    // 1. GÉOCODAGE DE PARIS
    // =========================

    const parisUrl =
      `https://api.geoapify.com/v1/geocode/search` +
      `?text=${encodeURIComponent("Paris, France")}` +
      `&filter=countrycode:fr` +
      `&limit=1` +
      `&apiKey=${GEOAPIFY_API_KEY}`;

    const parisResponse = await fetch(parisUrl);
    const parisData = await parisResponse.json();

    if (!parisResponse.ok || !parisData.features?.length) {
      return NextResponse.json(
        {
          success: false,
          step: "geocodage_depart",
          status: parisResponse.status,
          details: parisData,
        },
        { status: 500 }
      );
    }

    const paris = parisData.features[0];
    const parisCoordinates = paris.geometry.coordinates;

    // =========================
    // 2. GÉOCODAGE DE VERSAILLES
    // =========================

    const versaillesUrl =
      `https://api.geoapify.com/v1/geocode/search` +
      `?text=${encodeURIComponent("Versailles, France")}` +
      `&filter=countrycode:fr` +
      `&limit=1` +
      `&apiKey=${GEOAPIFY_API_KEY}`;

    const versaillesResponse = await fetch(versaillesUrl);
    const versaillesData = await versaillesResponse.json();

    if (!versaillesResponse.ok || !versaillesData.features?.length) {
      return NextResponse.json(
        {
          success: false,
          step: "geocodage_arrivee",
          status: versaillesResponse.status,
          details: versaillesData,
        },
        { status: 500 }
      );
    }

    const versailles = versaillesData.features[0];
    const versaillesCoordinates = versailles.geometry.coordinates;

    // =========================
    // 3. CALCUL DU TRAJET
    // =========================

    const routingUrl =
      `https://api.geoapify.com/v1/routing` +
      `?waypoints=` +
      `${parisCoordinates[1]},${parisCoordinates[0]}` +
      `|` +
      `${versaillesCoordinates[1]},${versaillesCoordinates[0]}` +
      `&mode=drive` +
      `&apiKey=${GEOAPIFY_API_KEY}`;

    const routingResponse = await fetch(routingUrl);
    const routingData = await routingResponse.json();

    if (!routingResponse.ok || !routingData.features?.length) {
      return NextResponse.json(
        {
          success: false,
          step: "calcul_route",
          status: routingResponse.status,
          details: routingData,
        },
        { status: 500 }
      );
    }

    const route = routingData.features[0];
    const properties = route.properties;

    // =========================
    // 4. DISTANCE / DURÉE
    // =========================

    const distanceKm = properties.distance / 1000;
    const durationMinutes = Math.round(properties.time / 60);

    // =========================
    // 5. RÉSULTAT
    // =========================

    return NextResponse.json({
      success: true,

      test: {
        depart: "Paris",
        arrivee: "Versailles",
      },

      geocodage: {
        depart: {
          ville: paris.properties.city || paris.properties.name,
          latitude: parisCoordinates[1],
          longitude: parisCoordinates[0],
        },

        arrivee: {
          ville:
            versailles.properties.city || versailles.properties.name,
          latitude: versaillesCoordinates[1],
          longitude: versaillesCoordinates[0],
        },
      },

      trajet: {
        distanceKm: Number(distanceKm.toFixed(1)),
        dureeMinutes: durationMinutes,
        mode: "drive",
      },

      message: "Calcul Geoapify opérationnel.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur",
        details: error.message,
      },
      { status: 500 }
    );
  }
}