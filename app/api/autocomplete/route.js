import { NextResponse } from "next/server";

const GEOAPIFY_API_KEY =
  process.env.GEOAPIFY_API_KEY;

/* =========================================================
   NORMALISATION
========================================================= */

function normalizeAddressQuery(text) {
  return String(text || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(
      /^(\d+[A-Za-z]?(?:\s*(?:bis|ter|quater))?(?:\s*[-/]\s*\d+[A-Za-z]?)?)\s*(rue|avenue|av|boulevard|bd|chemin|route|place|impasse|allee|allée|cours|quai|square|passage|voie|résidence|residence)\b/i,
      "$1 $2"
    );
}

/* =========================================================
   VILLE
========================================================= */

function getCity(properties) {
  return (
    properties.city ||
    properties.town ||
    properties.village ||
    properties.municipality ||
    ""
  );
}

/* =========================================================
   NUMÉRO
========================================================= */

function extractHouseNumber(text) {
  const match = String(text || "").match(
    /^\s*(\d+(?:[A-Za-z])?(?:\s*(?:bis|ter|quater))?(?:\s*[-/]\s*\d+(?:[A-Za-z])?)?)/i
  );

  return match
    ? match[1].trim()
    : "";
}

function normalizeHouseNumber(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/* =========================================================
   ADRESSE AFFICHÉE
========================================================= */

function buildFormattedAddress(properties) {
  const houseNumber =
    properties.housenumber ||
    properties.house_number ||
    "";

  const street =
    properties.street ||
    properties.address_line1 ||
    "";

  const postcode =
    properties.postcode ||
    "";

  const city =
    getCity(properties);

  if (
    houseNumber &&
    street &&
    postcode &&
    city
  ) {
    return `${houseNumber} ${street}, ${postcode} ${city}`;
  }

  if (
    houseNumber &&
    street
  ) {
    return `${houseNumber} ${street}${
      city
        ? `, ${postcode ? `${postcode} ` : ""}${city}`
        : ""
    }`;
  }

  return (
    properties.formatted ||
    [
      street,
      [postcode, city]
        .filter(Boolean)
        .join(" "),
    ]
      .filter(Boolean)
      .join(", ")
  );
}

/* =========================================================
   SCORE
========================================================= */

function scoreSuggestion(feature, query) {
  const properties =
    feature.properties || {};

  const formatted =
    String(
      properties.formatted ||
        properties.address_line1 ||
        ""
    ).toLowerCase();

  const street =
    String(
      properties.street || ""
    ).toLowerCase();

  const requestedNumber =
    normalizeHouseNumber(
      extractHouseNumber(query)
    );

  const returnedNumber =
    normalizeHouseNumber(
      properties.housenumber ||
        properties.house_number ||
        ""
    );

  const resultType =
    String(
      properties.result_type || ""
    ).toLowerCase();

  let score = 0;

  /* Numéro */

  if (requestedNumber) {
    if (returnedNumber) {
      score += 100;
    }

    if (
      returnedNumber ===
      requestedNumber
    ) {
      score += 2500;
    }

    const escaped =
      requestedNumber.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

    if (
      new RegExp(
        `^\\s*${escaped}\\b`,
        "i"
      ).test(
        properties.formatted ||
          properties.address_line1 ||
          ""
      )
    ) {
      score += 500;
    }
  }

  /* Type */

  if (
    resultType === "building" ||
    resultType === "house"
  ) {
    score += 300;
  }

  if (
    resultType === "amenity"
  ) {
    score += 150;
  }

  if (
    resultType === "street"
  ) {
    score -= 400;
  }

  if (
    resultType === "city" ||
    resultType === "postcode"
  ) {
    score -= 600;
  }

  /* Adresse complète */

  if (
    properties.postcode &&
    getCity(properties)
  ) {
    score += 100;
  }

  /* Confiance */

  const confidence =
    properties.rank?.confidence;

  if (
    typeof confidence === "number"
  ) {
    score += confidence * 100;
  }

  const buildingConfidence =
    properties.rank
      ?.confidence_building_level;

  if (
    typeof buildingConfidence ===
    "number"
  ) {
    score +=
      buildingConfidence * 150;
  }

  /* Correspondance */

  const normalizedQuery =
    String(query || "")
      .toLowerCase()
      .trim();

  if (
    formatted.includes(
      normalizedQuery
    )
  ) {
    score += 200;
  }

  if (
    street &&
    normalizedQuery.includes(
      street
    )
  ) {
    score += 100;
  }

  return score;
}

/* =========================================================
   FETCH
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
   GET
========================================================= */

export async function GET(request) {
  try {
    if (!GEOAPIFY_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error:
            "GEOAPIFY_API_KEY non configurée.",
          suggestions: [],
        },
        { status: 500 }
      );
    }

    const { searchParams } =
      new URL(request.url);

    const rawText =
      searchParams.get("text") ||
      "";

    if (
      rawText.trim().length < 3
    ) {
      return NextResponse.json({
        success: true,
        suggestions: [],
      });
    }

    const text =
      normalizeAddressQuery(
        rawText
      );

    const requestedNumber =
      extractHouseNumber(text);

    /* =====================================================
       AUTOCOMPLETE
    ===================================================== */

    const autocompleteUrl =
      "https://api.geoapify.com/v1/geocode/autocomplete" +
      `?text=${encodeURIComponent(text)}` +
      "&limit=10" +
      "&filter=countrycode:fr" +
      "&lang=fr" +
      `&apiKey=${GEOAPIFY_API_KEY}`;

    let autocompleteFeatures = [];

    try {
      const data =
        await fetchGeoapify(
          autocompleteUrl
        );

      autocompleteFeatures =
        Array.isArray(data.features)
          ? data.features
          : [];
    } catch (error) {
      console.warn(
        "Autocomplete Geoapify :",
        error?.message
      );
    }

    /* =====================================================
       RECHERCHE PRÉCISE SI NUMÉRO
    ===================================================== */

    let preciseFeatures = [];

    if (requestedNumber) {
      const preciseUrl =
        "https://api.geoapify.com/v1/geocode/search" +
        `?text=${encodeURIComponent(text)}` +
        `&housenumber=${encodeURIComponent(
          requestedNumber
        )}` +
        "&limit=10" +
        "&filter=countrycode:fr" +
        "&lang=fr" +
        `&apiKey=${GEOAPIFY_API_KEY}`;

      try {
        const data =
          await fetchGeoapify(
            preciseUrl
          );

        preciseFeatures =
          Array.isArray(data.features)
            ? data.features
            : [];
      } catch (error) {
        console.warn(
          "Recherche précise Geoapify :",
          error?.message
        );
      }
    }

    /* =====================================================
       FUSION
    ===================================================== */

    const features = [
      ...preciseFeatures,
      ...autocompleteFeatures,
    ];

    /* =====================================================
       DOUBLONS
    ===================================================== */

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

    /* =====================================================
       TRANSFORMATION
    ===================================================== */

    const suggestions =
      Array.from(unique.values())
        .map((feature) => {
          const properties =
            feature.properties || {};

          const coordinates =
            feature.geometry
              ?.coordinates || [];

          const housenumber =
            properties.housenumber ||
            properties.house_number ||
            "";

          const street =
            properties.street ||
            properties.address_line1 ||
            "";

          const postcode =
            properties.postcode ||
            "";

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
            [
              postcode,
              city,
            ]
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
              properties.result_type ||
              "",

            placeId:
              properties.place_id ||
              null,

            latitude:
              coordinates.length >= 2
                ? Number(
                    coordinates[1]
                  )
                : null,

            longitude:
              coordinates.length >= 2
                ? Number(
                    coordinates[0]
                  )
                : null,

            confidence:
              properties.rank
                ?.confidence ??
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
            item.formatted &&
            item.latitude !== null &&
            item.longitude !== null
        );

    /* =====================================================
       TRI
    ===================================================== */

    suggestions.sort(
      (a, b) => {
        if (requestedNumber) {
          const requested =
            normalizeHouseNumber(
              requestedNumber
            );

          const aNumber =
            normalizeHouseNumber(
              a.housenumber
            );

          const bNumber =
            normalizeHouseNumber(
              b.housenumber
            );

          const aExact =
            aNumber === requested;

          const bExact =
            bNumber === requested;

          if (
            aExact !== bExact
          ) {
            return aExact
              ? -1
              : 1;
          }

          const aHasNumber =
            Boolean(aNumber);

          const bHasNumber =
            Boolean(bNumber);

          if (
            aHasNumber !==
            bHasNumber
          ) {
            return aHasNumber
              ? -1
              : 1;
          }
        }

        return (
          b._score -
          a._score
        );
      }
    );

    /* =====================================================
       RÉSULTAT
    ===================================================== */

    const finalSuggestions =
      suggestions
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
        suggestions:
          finalSuggestions,
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
      "Autocomplete Geoapify :",
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