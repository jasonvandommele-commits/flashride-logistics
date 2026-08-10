import { NextResponse } from "next/server";

const GEOAPIFY_API_KEY =
  process.env.GEOAPIFY_API_KEY;

/* =========================================================
   NORMALISATION
========================================================= */

function normalizeAddressQuery(text) {
  let value = String(text || "")
    .trim()
    .replace(/\s+/g, " ");

  /*
   * Corrige automatiquement :
   *
   * 6rue       → 6 rue
   * 12avenue   → 12 avenue
   * 5boulevard → 5 boulevard
   * 10bd       → 10 bd
   * 4chemin    → 4 chemin
   *
   * Fonctionne pour n'importe quel numéro.
   */

  value = value.replace(
    /^(\d+[A-Za-z]?(?:\s*(?:bis|ter|quater))?(?:\s*[-/]\s*\d+[A-Za-z]?)?)\s*(rue|avenue|av|boulevard|bd|chemin|route|place|impasse|allée|allee|cours|quai|square|passage|voie|lotissement|résidence|residence)\b/i,
    "$1 $2"
  );

  return value;
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
   NUMÉRO DEMANDÉ
========================================================= */

function extractHouseNumber(text) {
  const match = String(text || "").match(
    /^\s*(\d+(?:[A-Za-z])?(?:\s*(?:bis|ter|quater))?(?:\s*[-/]\s*\d+(?:[A-Za-z])?)?)/i
  );

  return match
    ? match[1].trim()
    : "";
}

/* =========================================================
   ADRESSE FORMATTÉE
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
    properties.postcode || "";

  const city =
    getCity(properties);

  if (houseNumber && street) {
    return [
      `${houseNumber} ${street}`,
      [postcode, city]
        .filter(Boolean)
        .join(" "),
    ]
      .filter(Boolean)
      .join(", ");
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
   NUMÉRO DANS LE RÉSULTAT
========================================================= */

function getReturnedHouseNumber(properties) {
  return String(
    properties.housenumber ||
      properties.house_number ||
      ""
  ).trim();
}

/* =========================================================
   SCORE
========================================================= */

function scoreSuggestion(
  feature,
  originalText,
  normalizedText
) {
  const properties =
    feature.properties || {};

  const formatted = String(
    properties.formatted ||
      properties.address_line1 ||
      ""
  )
    .trim()
    .toLowerCase();

  const street = String(
    properties.street || ""
  )
    .trim()
    .toLowerCase();

  const returnedNumber =
    getReturnedHouseNumber(
      properties
    ).toLowerCase();

  const requestedNumber =
    extractHouseNumber(
      normalizedText
    ).toLowerCase();

  const resultType = String(
    properties.result_type || ""
  ).toLowerCase();

  let score = 0;

  /* -------------------------------------------------------
     NUMÉRO : PRIORITÉ MAXIMALE
  ------------------------------------------------------- */

  if (requestedNumber) {
    if (
      returnedNumber ===
      requestedNumber
    ) {
      score += 5000;
    } else if (returnedNumber) {
      score += 200;
    } else {
      score -= 1000;
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
      ).test(formatted)
    ) {
      score += 2000;
    }
  }

  /* -------------------------------------------------------
     TYPE DE RÉSULTAT
  ------------------------------------------------------- */

  if (
    resultType === "building" ||
    resultType === "house"
  ) {
    score += 500;
  }

  if (resultType === "amenity") {
    score += 300;
  }

  if (resultType === "street") {
    score -= 1000;
  }

  if (resultType === "city") {
    score -= 2000;
  }

  /* -------------------------------------------------------
     ADRESSE COMPLÈTE
  ------------------------------------------------------- */

  if (
    properties.postcode &&
    getCity(properties)
  ) {
    score += 100;
  }

  /* -------------------------------------------------------
     CORRESPONDANCE TEXTE
  ------------------------------------------------------- */

  const normalizedOriginal =
    String(normalizedText)
      .toLowerCase();

  if (
    formatted.includes(
      normalizedOriginal
    )
  ) {
    score += 500;
  }

  const words =
    normalizedOriginal
      .split(/[\s,]+/)
      .filter(
        (word) =>
          word.length >= 2
      );

  for (const word of words) {
    if (
      formatted.includes(word)
    ) {
      score += 10;
    }

    if (
      street.includes(word)
    ) {
      score += 15;
    }
  }

  return score;
}

/* =========================================================
   GEOAPIFY
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
        },
        { status: 500 }
      );
    }

    const {
      searchParams,
    } = new URL(request.url);

    const rawText =
      searchParams.get("text") || "";

    if (
      rawText.trim().length < 2
    ) {
      return NextResponse.json({
        success: true,
        suggestions: [],
      });
    }

    /*
     * Exemple :
     * 6rue Delaporte
     * devient
     * 6 rue Delaporte
     */

    const text =
      normalizeAddressQuery(
        rawText
      );

    const requestedNumber =
      extractHouseNumber(text);

    let features = [];

    /* =====================================================
       RECHERCHE AUTOCOMPLETE
    ===================================================== */

    const autocompleteUrl =
      "https://api.geoapify.com/v1/geocode/autocomplete" +
      `?text=${encodeURIComponent(
        text
      )}` +
      "&limit=10" +
      "&filter=countrycode:fr" +
      "&lang=fr" +
      `&apiKey=${GEOAPIFY_API_KEY}`;

    try {
      const data =
        await fetchGeoapify(
          autocompleteUrl
        );

      features.push(
        ...(data.features || [])
      );
    } catch (error) {
      console.warn(
        "Autocomplete Geoapify :",
        error.message
      );
    }

    /* =====================================================
       RECHERCHE ADRESSE PRÉCISE
       SI UN NUMÉRO EST SAISI
    ===================================================== */

    if (requestedNumber) {
      const searchUrl =
        "https://api.geoapify.com/v1/geocode/search" +
        `?text=${encodeURIComponent(
          text
        )}` +
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
            searchUrl
          );

        features.push(
          ...(data.features || [])
        );
      } catch (error) {
        console.warn(
          "Recherche adresse précise :",
          error.message
        );
      }
    }

    /* =====================================================
       SUPPRESSION DES DOUBLONS
    ===================================================== */

    const unique =
      new Map();

    for (const feature of features) {
      const properties =
        feature.properties || {};

      const coordinates =
        feature.geometry
          ?.coordinates || [];

      const key =
        properties.place_id ||
        [
          properties.formatted,
          coordinates[0],
          coordinates[1],
        ].join("|");

      if (!unique.has(key)) {
        unique.set(
          key,
          feature
        );
      }
    }

    /* =====================================================
       TRI
    ===================================================== */

    const sorted =
      Array.from(
        unique.values()
      )
        .map((feature) => ({
          feature,
          score:
            scoreSuggestion(
              feature,
              rawText,
              text
            ),
        }))
        .sort(
          (a, b) =>
            b.score - a.score
        );

    /* =====================================================
       FORMAT POUR REACT
    ===================================================== */

    const suggestions =
      sorted
        .slice(0, 6)
        .map(({ feature }) => {
          const properties =
            feature.properties || {};

          const coordinates =
            feature.geometry
              ?.coordinates || [];

          const housenumber =
            getReturnedHouseNumber(
              properties
            );

          const street =
            properties.street ||
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
              : properties.address_line1 ||
                street ||
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

            latitude:
              coordinates.length >= 2
                ? coordinates[1]
                : null,

            longitude:
              coordinates.length >= 2
                ? coordinates[0]
                : null,

            placeId:
              properties.place_id ||
              null,

            resultType:
              properties.result_type ||
              "",

            confidence:
              properties.rank
                ?.confidence ??
              null,
          };
        })
        .filter(
          (item) =>
            item.formatted
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
      "Autocomplete Geoapify :",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Erreur pendant l'autocomplétion.",
        suggestions: [],
      },
      { status: 500 }
    );
  }
}