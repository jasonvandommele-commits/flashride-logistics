import { NextResponse } from "next/server";

const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;

function normalizeAddressQuery(text) {
  return String(text || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(
      /^(\d+[A-Za-z]?)\s*(rue|avenue|av|boulevard|bd|chemin|route|place|impasse|allee|allée|cours|quai|square|passage)\b/i,
      "$1 $2"
    );
}

function getCity(properties) {
  return (
    properties.city ||
    properties.town ||
    properties.village ||
    properties.municipality ||
    ""
  );
}

function buildFormattedAddress(properties) {
  const houseNumber = properties.housenumber || "";
  const street =
    properties.street ||
    properties.address_line1 ||
    "";
  const postcode = properties.postcode || "";
  const city = getCity(properties);

  if (houseNumber && street) {
    return [
      `${houseNumber} ${street}`,
      [postcode, city].filter(Boolean).join(" "),
    ]
      .filter(Boolean)
      .join(", ");
  }

  return (
    properties.formatted ||
    [
      street,
      [postcode, city].filter(Boolean).join(" "),
    ]
      .filter(Boolean)
      .join(", ")
  );
}

function extractHouseNumber(text) {
  const match = String(text || "").match(
    /^\s*(\d+(?:[A-Za-z])?(?:\s*(?:bis|ter|quater))?(?:\s*[-/]\s*\d+(?:[A-Za-z])?)?)/i
  );

  return match ? match[1].trim() : null;
}

function scoreSuggestion(feature, query) {
  const properties = feature.properties || {};

  const formatted = String(
    properties.formatted ||
      properties.address_line1 ||
      ""
  ).toLowerCase();

  const street = String(
    properties.street || ""
  ).toLowerCase();

  const requestedNumber = extractHouseNumber(query);

  const returnedNumber = String(
    properties.housenumber ||
      properties.house_number ||
      ""
  ).trim();

  const resultType = String(
    properties.result_type || ""
  ).toLowerCase();

  let score = 0;

  // Numéro demandé
  if (requestedNumber) {
    if (returnedNumber) {
      score += 100;
    }

    if (
      returnedNumber.toLowerCase() ===
      requestedNumber.toLowerCase()
    ) {
      score += 500;
    }

    const escaped = requestedNumber.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    if (
      new RegExp(
        `^\\s*${escaped}\\b`,
        "i"
      ).test(
        properties.formatted || ""
      )
    ) {
      score += 300;
    }
  }

  // Type de résultat
  if (
    resultType === "building" ||
    resultType === "house"
  ) {
    score += 100;
  }

  if (resultType === "street") {
    score -= 100;
  }

  if (
    resultType === "city" ||
    resultType === "postcode"
  ) {
    score -= 150;
  }

  // Adresse complète
  if (
    properties.postcode &&
    getCity(properties)
  ) {
    score += 40;
  }

  // Confiance Geoapify
  const confidence =
    properties.rank?.confidence;

  if (typeof confidence === "number") {
    score += confidence * 100;
  }

  // Correspondance texte
  const normalizedQuery =
    query.toLowerCase();

  if (
    formatted.includes(
      normalizedQuery
    )
  ) {
    score += 100;
  }

  if (
    street &&
    normalizedQuery.includes(street)
  ) {
    score += 50;
  }

  return score;
}

async function fetchGeoapify(url) {
  const response = await fetch(url, {
    method: "GET",
    next: {
      revalidate: 30,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `Geoapify ${response.status}`
    );
  }

  return data;
}

export async function GET(request) {
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

    const { searchParams } =
      new URL(request.url);

    const rawText =
      searchParams.get("text") || "";

    if (rawText.trim().length < 3) {
      return NextResponse.json({
        success: true,
        suggestions: [],
      });
    }

    const text =
      normalizeAddressQuery(rawText);

    const requestedNumber =
      extractHouseNumber(text);

    /*
     * UNE seule requête autocomplete.
     *
     * C'est volontaire :
     * on évite de faire une deuxième requête
     * "search" à chaque frappe.
     */
    const url =
      "https://api.geoapify.com/v1/geocode/autocomplete" +
      `?text=${encodeURIComponent(text)}` +
      "&limit=8" +
      "&filter=countrycode:fr" +
      "&lang=fr" +
      `&apiKey=${GEOAPIFY_API_KEY}`;

    const data =
      await fetchGeoapify(url);

    const features = Array.isArray(
      data.features
    )
      ? data.features
      : [];

    const unique = new Map();

    for (const feature of features) {
      const properties =
        feature.properties || {};

      const coordinates =
        feature.geometry?.coordinates || [];

      const key =
        properties.place_id ||
        [
          properties.formatted,
          coordinates[0],
          coordinates[1],
        ].join("|");

      if (!unique.has(key)) {
        unique.set(key, feature);
      }
    }

    const suggestions = Array.from(
      unique.values()
    )
      .map((feature) => {
        const properties =
          feature.properties || {};

        const coordinates =
          feature.geometry?.coordinates || [];

        const housenumber =
          properties.housenumber ||
          properties.house_number ||
          "";

        const street =
          properties.street ||
          properties.address_line1 ||
          "";

        const postcode =
          properties.postcode || "";

        const city =
          getCity(properties);

        const formatted =
          buildFormattedAddress(
            properties
          );

        const addressLine1 =
          housenumber && street
            ? `${housenumber} ${street}`
            : street ||
              properties.formatted ||
              "";

        const addressLine2 =
          [postcode, city]
            .filter(Boolean)
            .join(" ");

        return {
          formatted,
          addressLine1,
          addressLine2,
          postcode,
          city,
          housenumber,
          street,
          resultType:
            properties.result_type || "",
          placeId:
            properties.place_id || null,
          latitude:
            coordinates.length >= 2
              ? coordinates[1]
              : null,
          longitude:
            coordinates.length >= 2
              ? coordinates[0]
              : null,
          confidence:
            properties.rank?.confidence ??
            null,
          _score:
            scoreSuggestion(
              feature,
              text
            ),
        };
      })
      .filter(
        (item) =>
          item.formatted
      )
      .sort((a, b) => {
        /*
         * Si l'utilisateur tape un numéro,
         * le bon numéro passe absolument devant.
         */
        if (requestedNumber) {
          const aExact =
            String(
              a.housenumber || ""
            ).toLowerCase() ===
            requestedNumber.toLowerCase();

          const bExact =
            String(
              b.housenumber || ""
            ).toLowerCase() ===
            requestedNumber.toLowerCase();

          if (aExact !== bExact) {
            return aExact ? -1 : 1;
          }
        }

        return b._score - a._score;
      })
      .slice(0, 6)
      .map(
        ({
          _score,
          ...suggestion
        }) => suggestion
      );

    return NextResponse.json(
      {
        success: true,
        suggestions,
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error(
      "Autocomplete Geoapify:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Erreur pendant la recherche d'adresse.",
        suggestions: [],
      },
      { status: 500 }
    );
  }
}