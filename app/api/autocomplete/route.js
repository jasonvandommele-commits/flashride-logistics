import { NextResponse } from "next/server";

const GEOAPIFY_API_KEY =
  process.env.GEOAPIFY_API_KEY;

/* =========================================================
   ÎLE-DE-FRANCE
========================================================= */

function isIleDeFrancePostcode(postcode) {
  const cp = String(postcode || "").trim();

  return /^(75|77|78|91|92|93|94|95)\d{3}$/.test(cp);
}

/* =========================================================
   NORMALISATION
========================================================= */

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, " ")
    .replace(/[-/,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

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
   MOTS DE LA REQUÊTE
========================================================= */

function getQueryTokens(query) {
  return normalizeText(query)
    .split(" ")
    .filter(
      (token) =>
        token.length >= 2 &&
        !/^\d+[a-z]*$/.test(token)
    );
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
   TYPE DE RÉSULTAT
========================================================= */

function getResultTypeScore(properties) {
  const resultType =
    String(
      properties.result_type || ""
    ).toLowerCase();

  switch (resultType) {
    case "building":
      return 500;

    case "house":
      return 500;

    case "amenity":
      return 300;

    case "street":
      return -700;

    case "city":
      return -1000;

    case "postcode":
      return -1000;

    case "district":
      return -500;

    case "locality":
      return -500;

    default:
      return 0;
  }
}

/* =========================================================
   SCORE PRINCIPAL
========================================================= */

function scoreSuggestion(
  feature,
  query,
  requestedNumber
) {
  const properties =
    feature.properties || {};

  const formatted =
    String(
      properties.formatted ||
        properties.address_line1 ||
        ""
    );

  const street =
    String(
      properties.street ||
        properties.address_line1 ||
        ""
    );

  const city =
    getCity(properties);

  const postcode =
    String(
      properties.postcode || ""
    );

  const normalizedQuery =
    normalizeText(query);

  const normalizedFormatted =
    normalizeText(formatted);

  const normalizedStreet =
    normalizeText(street);

  const normalizedCity =
    normalizeText(city);

  const normalizedNumber =
    normalizeHouseNumber(
      requestedNumber
    );

  const returnedNumber =
    normalizeHouseNumber(
      properties.housenumber ||
        properties.house_number ||
        ""
    );

  let score = 0;

  /* =======================================================
     1. NUMÉRO
  ======================================================= */

  if (normalizedNumber) {
    if (returnedNumber) {
      score += 150;
    }

    if (
      returnedNumber ===
      normalizedNumber
    ) {
      score += 5000;
    } else if (
      returnedNumber &&
      returnedNumber !==
        normalizedNumber
    ) {
      score -= 1500;
    }
  }

  /* =======================================================
     2. TYPE
  ======================================================= */

  score +=
    getResultTypeScore(
      properties
    );

  /* =======================================================
     3. VILLE EXPLICITEMENT DEMANDÉE
  ======================================================= */

  const queryTokens =
    getQueryTokens(query);

  /*
   * On cherche si le nom de la ville
   * retournée par Geoapify apparaît
   * réellement dans la requête.
   */

  if (normalizedCity) {
    const cityTokens =
      normalizedCity
        .split(" ")
        .filter(
          (token) =>
            token.length >= 3
        );

    const matchingCityTokens =
      cityTokens.filter((token) =>
        queryTokens.includes(token)
      );

    if (
      matchingCityTokens.length >
      0
    ) {
      score +=
        2500 *
        matchingCityTokens.length;
    }
  }

  /* =======================================================
     4. CODE POSTAL
  ======================================================= */

  const postcodeMatch =
    normalizedQuery.match(
      /\b\d{5}\b/
    );

  if (postcodeMatch) {
    if (
      postcode ===
      postcodeMatch[0]
    ) {
      score += 3500;
    }
  }

  /* =======================================================
     5. RUE
  ======================================================= */

  const normalizedStreetTokens =
    normalizedStreet
      .split(" ")
      .filter(
        (token) =>
          token.length >= 3
      );

  let matchingStreetTokens = 0;

  for (const token of normalizedStreetTokens) {
    if (
      queryTokens.includes(token)
    ) {
      matchingStreetTokens++;
    }
  }

  score +=
    matchingStreetTokens * 350;

  /*
   * Correspondance exacte de la rue.
   */

  if (
    normalizedStreet &&
    normalizedQuery.includes(
      normalizedStreet
    )
  ) {
    score += 1000;
  }

  /* =======================================================
     6. CORRESPONDANCE DU TEXTE COMPLET
  ======================================================= */

  if (
    normalizedFormatted.includes(
      normalizedQuery
    )
  ) {
    score += 500;
  }

  /* =======================================================
     7. ADRESSE COMPLÈTE
  ======================================================= */

  if (
    properties.postcode &&
    city &&
    street
  ) {
    score += 300;
  }

  /* =======================================================
     8. NIVEAU DE CONFIANCE
  ======================================================= */

  const confidence =
    Number(
      properties.rank?.confidence ||
        0
    );

  if (
    Number.isFinite(confidence)
  ) {
    score +=
      confidence * 150;
  }

  const buildingConfidence =
    Number(
      properties.rank
        ?.confidence_building_level ||
        0
    );

  if (
    Number.isFinite(
      buildingConfidence
    )
  ) {
    score +=
      buildingConfidence * 250;
  }

  /* =======================================================
     9. PRIORITÉ ÎLE-DE-FRANCE
     
     IMPORTANT :
     seulement lorsque l'utilisateur
     n'a PAS indiqué de ville ou de CP.
  ======================================================= */

  const hasExplicitLocation =
    Boolean(
      postcodeMatch
    ) ||
    queryTokens.some(
      (token) =>
        token === "paris" ||
        token === "boulogne" ||
        token === "creteil" ||
        token === "creteil" ||
        token === "vincennes" ||
        token === "montreuil" ||
        token === "versailles" ||
        token === "nanterre" ||
        token === "courbevoie" ||
        token === "saint-denis" ||
        token === "argenteuil" ||
        token === "colombes" ||
        token === "champigny"
    );

  if (
    !hasExplicitLocation &&
    isIleDeFrancePostcode(
      postcode
    )
  ) {
    score += 1800;
  }

  /* =======================================================
     10. PÉNALITÉ HORS FRANCE / LOCALISATION FAIBLE
  ======================================================= */

  const countryCode =
    String(
      properties.country_code ||
        ""
    ).toLowerCase();

  if (
    countryCode &&
    countryCode !== "fr"
  ) {
    score -= 10000;
  }

  return score;
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
      `?text=${encodeURIComponent(
        text
      )}` +
      "&limit=20" +
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
        Array.isArray(
          data.features
        )
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
        `?text=${encodeURIComponent(
          text
        )}` +
        `&housenumber=${encodeURIComponent(
          requestedNumber
        )}` +
        "&limit=20" +
        "&filter=countrycode:fr" +
        "&lang=fr" +
        `&apiKey=${GEOAPIFY_API_KEY}`;

      try {
        const data =
          await fetchGeoapify(
            preciseUrl
          );

        preciseFeatures =
          Array.isArray(
            data.features
          )
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
          properties.formatted ||
            "",
          coordinates[0] ||
            "",
          coordinates[1] ||
            "",
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
      Array.from(
        unique.values()
      )
        .map((feature) => {
          const properties =
            feature.properties ||
            {};

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

          const score =
            scoreSuggestion(
              feature,
              text,
              requestedNumber
            );

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

            _score: score,
          };
        })
        .filter(
          (item) =>
            item.formatted &&
            item.latitude !== null &&
            item.longitude !== null
        );

    /* =====================================================
       TRI FINAL
    ===================================================== */

    suggestions.sort(
      (a, b) =>
        b._score - a._score
    );

    /* =====================================================
       ÉVITER LES DOUBLONS VISUELS
    ===================================================== */

    const seenAddresses =
      new Set();

    const finalSuggestions = [];

    for (const suggestion of suggestions) {
      const key =
        normalizeText(
          suggestion.formatted
        );

      if (
        seenAddresses.has(key)
      ) {
        continue;
      }

      seenAddresses.add(key);

      const {
        _score,
        ...cleanSuggestion
      } = suggestion;

      finalSuggestions.push(
        cleanSuggestion
      );

      if (
        finalSuggestions.length >=
        6
      ) {
        break;
      }
    }

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