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

    // 1. Géocodage de Paris
    const parisResponse = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
        "Paris, France"
      )}&filter=countrycode:fr&limit=1&apiKey=${GEOAPIFY_API_KEY}`
    );

    const parisData = await parisResponse.json();

    if (!parisResponse.ok || !parisData.results?.length) {
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

    const paris = parisData.results[0];

    // 2. Géocodage de Versailles
    const versaillesResponse = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
        "Versailles, France"
      )}&filter=countrycode:fr&limit=1&apiKey=${GEOAPIFY_API_KEY}`
    );

    const versaillesData = await versaillesResponse.json();

    if (!versaillesResponse.ok || !versaillesData.results?.length) {
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

    const versailles = versaillesData.results[0];

    // 3. Calcul de l'itinéraire routier
    const routingUrl =
      `https://api.geoapify.com/v1/routing` +
      `?waypoints=${paris.lat},${paris.lon}|${versailles.lat},${versailles.lon}` +
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

    // Distance en kilomètres
    const distanceKm = properties.distance / 1000;

    // Durée en minutes
    const durationMinutes = Math.round(properties.time / 60);

    return NextResponse.json({
      success: true,

      test: {
        depart: "Paris",
        arrivee: "Versailles",
      },

      geocodage: {
        depart: {
          ville: paris.city,
          latitude: paris.lat,
          longitude: paris.lon,
        },

        arrivee: {
          ville: versailles.city,
          latitude: versailles.lat,
          longitude: versailles.lon,
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