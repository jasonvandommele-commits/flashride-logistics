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
    const text = (searchParams.get("text") || "").trim();

    if (text.length < 3) {
      return NextResponse.json({
        success: true,
        suggestions: [],
      });
    }

    const url =
      "https://api.geoapify.com/v1/geocode/autocomplete" +
      `?text=${encodeURIComponent(text)}` +
      "&limit=8" +
      "&filter=countrycode:fr" +
      "&lang=fr" +
      `&apiKey=${GEOAPIFY_API_KEY}`;

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error:
            data?.message ||
            `Erreur Geoapify ${response.status}`,
        },
        { status: response.status }
      );
    }

    const features = Array.isArray(data.features)
      ? data.features
      : [];

    const suggestions = features
      .map((feature) => {
        const properties = feature.properties || {};
        const coordinates =
          feature.geometry?.coordinates || [];

        const houseNumber =
          properties.housenumber || "";

        const street =
          properties.street ||
          properties.address_line1 ||
          "";

        const postcode =
          properties.postcode || "";

        const city =
          properties.city ||
          properties.town ||
          properties.village ||
          properties.municipality ||
          "";

        const formatted =
          properties.formatted ||
          [
            houseNumber,
            street,
            postcode,
            city,
          ]
            .filter(Boolean)
            .join(", ");

        const addressLine1 =
          houseNumber && street
            ? `${houseNumber} ${street}`
            : street || formatted;

        const addressLine2 =
          [postcode, city]
            .filter(Boolean)
            .join(" ");

        const resultType =
          properties.result_type || "";

        const hasHouseNumber =
          Boolean(houseNumber) ||
          /^\s*\d+[A-Za-z]?\s+/.test(
            formatted
          );

        return {
          formatted,
          addressLine1,
          addressLine2,
          postcode,
          city,
          housenumber: houseNumber,
          street,
          resultType,
          hasHouseNumber,
          latitude:
            coordinates.length >= 2
              ? coordinates[1]
              : null,
          longitude:
            coordinates.length >= 2
              ? coordinates[0]
              : null,
          placeId:
            properties.place_id || null,
        };
      })
      .filter((item) => item.formatted);

    const userTypedNumber =
      /^\d+[A-Za-z]?\s/.test(text);

    suggestions.sort((a, b) => {
      // Si l'utilisateur a commencé par un numéro,
      // priorité absolue aux résultats avec numéro.
      if (
        userTypedNumber &&
        a.hasHouseNumber !== b.hasHouseNumber
      ) {
        return a.hasHouseNumber ? -1 : 1;
      }

      // Dans tous les cas, privilégier les adresses
      // contenant un numéro.
      if (
        a.hasHouseNumber !== b.hasHouseNumber
      ) {
        return a.hasHouseNumber ? -1 : 1;
      }

      // Ensuite privilégier les bâtiments/adresses.
      const preferredTypes = [
        "building",
        "house",
        "amenity",
        "street",
      ];

      const aPreferred =
        preferredTypes.includes(a.resultType);

      const bPreferred =
        preferredTypes.includes(b.resultType);

      if (aPreferred !== bPreferred) {
        return aPreferred ? -1 : 1;
      }

      return 0;
    });

    return NextResponse.json({
      success: true,
      suggestions: suggestions.slice(0, 6),
    });
  } catch (error) {
    console.error(
      "Autocomplete Geoapify:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          "Erreur pendant l'autocomplétion.",
      },
      { status: 500 }
    );
  }
}