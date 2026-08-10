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
    properties.locality ||
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
   TEXTE NORMALISÉ
========================================================= */

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’']/g, " ")
    .replace(/[-/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* =========================================================
   CODE POSTAL
========================================================= */

function normalizePostcode(value) {
  const postcode = String(value || "")
    .replace(/\s+/g, "")
    .trim();

  return /^\d{5}$/.test(postcode)
    ? postcode
    : "";
}

/* =========================================================
   VILLE COHÉRENTE AVEC LE CODE POSTAL
========================================================= */

/*
 * Geoapify peut parfois renvoyer une ville incorrecte
 * avec un code postal correct.
 *
 * Exemple possible :
 *
 * 32 Avenue Victor Hugo
 * 92170 Paris
 *
 * alors que 92170 correspond à Vanves.
 *
 * On utilise l'API officielle française
 * api-adresse.data.gouv.fr pour vérifier
 * la commune correspondant au code postal.
 *
 * Cette vérification est générale pour toute la France.
 */

async function getOfficialCityFromPostcode(postcode) {
  const normalizedPostcode =
    normalizePostcode(postcode);

  if (!normalizedPostcode) {
    return "";
  }

  try {
    const url =
      "https://api-adresse.data.gouv.fr/search/" +
      `?q=${encodeURIComponent(
        normalizedPostcode
      )}` +
      "&type=municipality" +
      "&limit=20";

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      return "";
    }

    const data = await response.json();

    const features =
      Array.isArray(data.features)
        ? data.features
        : [];

    /*
     * On cherche en priorité une commune dont
     * le code postal correspond exactement.
     */

    for (const feature of features) {
      const properties =
        feature.properties || {};

      const featurePostcode =
        Array.isArray(
          properties.postcode
        )
          ? properties.postcode
          : properties.postcode
          ? [properties.postcode]
          : [];

      if (
        featurePostcode.includes(
          normalizedPostcode
        )
      ) {
        return (
          properties.city ||
          properties.name ||
          ""
        );
      }
    }

    return "";
  } catch (error) {
    console.warn(
      "Vérification commune :",
      error?.message
    );

    return "";
  }
}

/* =========================================================
   ADRESSE AFFICHÉE
========================================================= */

function buildFormattedAddress(
  properties,
  officialCity = ""
) {
  const houseNumber =
    properties.housenumber ||
    properties.house_number ||
    "";

  const street =
    properties.street ||
    properties.address_line1 ||
    "";

  const postcode =
    normalizePostcode(
      properties.postcode
    );

  /*
   * Si une commune officielle a été trouvée
   * pour ce code postal, elle est prioritaire.
   */
  const city =
    officialCity ||
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
        ? `, ${
            postcode
              ? `${postcode} `
              : ""
          }${city}`
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

function scoreSuggestion(
  feature,
  query,
  officialCity = ""
) {
  const properties =
    feature.properties || {};

  const formatted =
    normalizeText(
      properties.formatted ||
        properties.address_line1 ||
        ""
    );

  const street =
    normalizeText(
      properties.street || ""
    );

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

  const postcode =
    normalizePostcode(
      properties.postcode
    );

  const returnedCity =
    normalizeText(
      getCity(properties)
    );

  const validatedCity =
    normalizeText(
      officialCity
    );

  let score = 0;

  /* =======================================================
     NUMÉRO
  ======================================================= */

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

  /* =======================================================
     TYPE DE RÉSULTAT
  ======================================================= */

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

  /* =======================================================
     ADRESSE COMPLÈTE
  ======================================================= */

  if (
    postcode &&
    (officialCity ||
      getCity(properties))
  ) {
    score += 100;
  }

  /* =======================================================
     CONFIANCE GEOAPIFY
  ======================================================= */

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

  /* =======================================================
     CORRESPONDANCE REQUÊTE
  ======================================================= */

  const normalizedQuery =
    normalizeText(query);

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

  /* =======================================================
     COHÉRENCE COMMUNE / CODE POSTAL
  ======================================================= */

  if (
    officialCity &&
    returnedCity &&
    validatedCity !== returnedCity
  ) {
    /*
     * Geoapify donne une commune différente
     * de celle validée par le code postal.
     *
     * On ne rejette pas le résultat car les
     * coordonnées peuvent être bonnes, mais
     * on le pénalise fortement.
     */
    score -= 1500;
  }

  if (
    officialCity &&
    validatedCity === returnedCity
  ) {
    score += 500;
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
       1. AUTOCOMPLETE GEOAPIFY
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
       2. RECHERCHE PRÉCISE SI NUMÉRO
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
       3. FUSION
    ===================================================== */

    const features = [
      ...preciseFeatures,
      ...autocompleteFeatures,
    ];

    /* =====================================================
       4. DOUBLONS
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
       5. TRANSFORMATION
    ===================================================== */

    const rawSuggestions =
      Array.from(
        unique.values()
      )
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
            normalizePostcode(
              properties.postcode
            );

          const city =
            getCity(properties);

          if (
            !postcode ||
            !city ||
            coordinates.length < 2
          ) {
            return null;
          }

          return {
            feature,
            properties,
            coordinates,
            housenumber,
            street,
            postcode,
            city,
          };
        })
        .filter(Boolean);

    /* =====================================================
       6. VALIDATION DES COMMUNES
    ===================================================== */

    /*
     * On ne fait pas une requête par suggestion.
     *
     * On récupère uniquement les codes postaux
     * uniques afin de limiter les appels API.
     */

    const uniquePostcodes =
      Array.from(
        new Set(
          rawSuggestions
            .map(
              (item) =>
                item.postcode
            )
            .filter(Boolean)
        )
      );

    const postcodeCities =
      new Map();

    await Promise.all(
      uniquePostcodes.map(
        async (postcode) => {
          const city =
            await getOfficialCityFromPostcode(
              postcode
            );

          if (city) {
            postcodeCities.set(
              postcode,
              city
            );
          }
        }
      )
    );

    /* =====================================================
       7. CRÉATION DES SUGGESTIONS
    ===================================================== */

    const suggestions =
      rawSuggestions
        .map((item) => {
          const {
            feature,
            properties,
            coordinates,
            housenumber,
            street,
            postcode,
            city,
          } = item;

          const officialCity =
            postcodeCities.get(
              postcode
            ) || "";

          /*
           * La commune officielle correspondant
           * au code postal devient prioritaire.
           */
          const finalCity =
            officialCity || city;

          const formatted =
            buildFormattedAddress(
              properties,
              finalCity
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
              finalCity,
            ]
              .filter(Boolean)
              .join(" ");

          return {
            formatted,

            addressLine1,

            addressLine2,

            postcode,

            city: finalCity,

            housenumber,

            street,

            resultType:
              properties.result_type ||
              "",

            placeId:
              properties.place_id ||
              null,

            latitude:
              Number(
                coordinates[1]
              ),

            longitude:
              Number(
                coordinates[0]
              ),

            confidence:
              properties.rank
                ?.confidence ??
              null,

            _score:
              scoreSuggestion(
                feature,
                text,
                officialCity
              ),
          };
        })
        .filter(
          (item) =>
            item.formatted &&
            Number.isFinite(
              item.latitude
            ) &&
            Number.isFinite(
              item.longitude
            )
        );

    /* =====================================================
       8. TRI
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
       9. RÉSULTAT FINAL
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