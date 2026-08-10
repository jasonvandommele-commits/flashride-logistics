import { NextResponse } from "next/server";

const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;

export async function GET(request) {
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

    const { searchParams } = new URL(request.url);
    const text = searchParams.get("text");

    if (!text || text.trim().length < 3) {
      return NextResponse.json({
        success: true,
        results: [],
      });
    }

    const url =
      `https://api.geoapify.com/v1/geocode/autocomplete` +
      `?text=${encodeURIComponent(text.trim())}` +
      `&limit=6` +
      `&lang=fr` +
      `&filter=countrycode:fr` +
      `&apiKey=${GEOAPIFY_API_KEY}`;

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Geoapify autocomplete:", data);

      return NextResponse.json(
        {
          success: false,
          error: "Erreur lors de la recherche d'adresse.",
          details: data,
        },
        { status: response.status }
      );
    }

    const results = (data.features || [])
      .map((feature) => {
        const properties = feature.properties || {};

        const street =
          properties.street ||
          properties.address_line1 ||
          properties.name ||
          "";

        const houseNumber =
          properties.housenumber ||
          "";

        const postcode =
          properties.postcode ||
          "";

        const city =
          properties.city ||
          properties.town ||
          properties.village ||
          properties.municipality ||
          "";

        const formatted =
          properties.formatted ||
          "";

        /*
         * On privilégie une adresse précise :
         * numéro + rue + code postal + ville.
         */
        let primary = "";

        if (houseNumber && street) {
          primary = `${houseNumber} ${street}`;
        } else if (street) {
          primary = street;
        } else if (formatted) {
          primary = formatted;
        } else {
          primary = city;
        }

        const secondaryParts = [];

        if (postcode) {
          secondaryParts.push(postcode);
        }

        if (city) {
          secondaryParts.push(city);
        }

        if (
          secondaryParts.length === 0 &&
          formatted &&
          formatted !== primary
        ) {
          secondaryParts.push(formatted);
        }

        const secondary =
          secondaryParts.join(" ") || "France";

        /*
         * label = valeur réellement envoyée
         * au calculateur.
         */
        let label = "";

        if (houseNumber && street && postcode && city) {
          label = `${houseNumber} ${street}, ${postcode} ${city}`;
        } else if (formatted) {
          label = formatted;
        } else {
          label = `${primary}, ${secondary}`;
        }

        return {
          label,
          primary,
          secondary,
          latitude:
            feature.geometry?.coordinates?.[1] || null,
          longitude:
            feature.geometry?.coordinates?.[0] || null,
          postcode,
          city,
          housenumber: houseNumber,
          street,
          formatted,
        };
      })
      /*
       * Les adresses avec numéro passent avant
       * les simples noms de rues.
       */
      .sort((a, b) => {
        const aHasNumber = a.housenumber ? 1 : 0;
        const bHasNumber = b.housenumber ? 1 : 0;

        return bHasNumber - aHasNumber;
      });

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error(
      "Erreur API adresse Flashride:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          "Erreur pendant la recherche d'adresse.",
      },
      { status: 500 }
    );
  }
}
