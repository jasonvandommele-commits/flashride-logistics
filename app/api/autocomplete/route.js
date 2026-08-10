import { NextResponse } from "next/server";

const GEOAPIFY_API_KEY =
  process.env.GEOAPIFY_API_KEY;

/* =========================================================
   NORMALISATION
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
   DÉTECTION CODE POSTAL DANS LA REQUÊTE
========================================================= */

function extractPostcode(text) {
  const match =
    String(text || "").match(
      /\b(\d{5})\b/
    );

  return match
    ? match[1]
    : "";
}

/* =========================================================
   DÉTECTION VILLE DANS LA REQUÊTE
========================================================= */

function extractRequestedCity(
  query,
  features
) {
  const normalizedQuery =
    normalizeText(query);

  /*
   * On cherche d'abord une ville connue
   * dans les résultats Geoapify.
   *
   * Exemple :
   *
   * "32 avenue Victor Hugo Paris"
   *
   * → Paris est détecté comme ville demandée.
   */

  const possibleCities =
    Array.from(
      new Set(
        features
          .map((feature) => {
            const properties =
              feature.properties || {};

            return getCity(
              properties
            );
          })
          .filter(Boolean)
      )
    );

  let bestCity = "";
  let bestLength = 0;

  for (const city of possibleCities) {
    const normalizedCity =
      normalizeText(city);

    if (
      normalizedCity.length < 3
    ) {
      continue;
    }

    if (
      normalizedQuery.includes(
        normalizedCity
      )
    ) {
      if (
        normalizedCity.length >
        bestLength
      ) {
        bestCity = city;
        bestLength =
          normalizedCity.length;
      }
    }
  }

  return bestCity;
}

/* =========================================================
   ÎLE-DE-FRANCE
========================================================= */

function isIleDeFrancePostcode(
  postcode
) {
  const cp =
    normalizePostcode(postcode);

  if (!cp) {
    return false;
  }

  return /^(75|77|78|91|92|93|94|95)\d{3}$/.test(
    cp
  );
}

/* =========================================================
   PRIORITÉ GÉOGRAPHIQUE IDF
========================================================= */

function getIleDeFrancePriority(
  postcode
) {
  const cp =
    normalizePostcode(postcode);

  if (!cp) {
    return 0;
  }

  if (/^75\d{3}$/.test(cp)) {
    return 500;
  }

  if (/^(92|93|94)\d{3}$/.test(cp)) {
    return 450;
  }

  if (/^(77|78|91|95)\d{3}$/.test(cp)) {
    return 400;
  }

  return 0;
}

/* =========================================================
   COMMUNE OFFICIELLE SELON CODE POSTAL
========================================================= */

async function getOfficialCityFromPostcode(
  postcode
) {
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

    const response =
      await fetch(url, {
        method: "GET",
        cache: "no-store",
      });

    if (!response.ok) {
      return "";
    }

    const data =
      await response.json();

    const features =
      Array.isArray(
        data.features
      )
        ? data.features
        : [];

    for (const feature of features) {
      const properties =
        feature.properties || {};

      const postcodes =
        Array.isArray(
          properties.postcode
        )
          ? properties.postcode
          : properties.postcode
          ? [properties.postcode]
          : [];

      if (
        postcodes.includes(
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

function scoreSuggestion({
  feature,
  query,
  requestedCity,
  requestedPostcode,
  officialCity,
}) {
  const properties =
    feature.properties || {};

  const normalizedQuery =
    normalizeText(query);

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

  const returnedCity =
    normalizeText(
      officialCity ||
        getCity(properties)
    );

  const geoapifyCity =
    normalizeText(
      getCity(properties)
    );

  const postcode =
    normalizePostcode(
      properties.postcode
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
      score += 3000;
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
    score += 500;
  }

  if (
    resultType === "amenity"
  ) {
    score += 200;
  }

  if (
    resultType === "street"
  ) {
    score -= 500;
  }

  if (
    resultType === "city" ||
    resultType === "postcode"
  ) {
    score -= 1000;
  }

  /* =======================================================
     ADRESSE COMPLÈTE
  ======================================================= */

  if (
    postcode &&
    returnedCity
  ) {
    score += 150;
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
      buildingConfidence * 200;
  }

  /* =======================================================
     CORRESPONDANCE RUE
  ======================================================= */

  if (
    formatted.includes(
      normalizedQuery
    )
  ) {
    score += 300;
  }

  if (
    street &&
    normalizedQuery.includes(
      street
    )
  ) {
    score += 150;
  }

  /* =======================================================
     CODE POSTAL DEMANDÉ
  ======================================================= */

  if (
    requestedPostcode
  ) {
    if (
      postcode ===
      requestedPostcode
    ) {
      score += 5000;
    } else {
      score -= 3000;
    }
  }

  /* =======================================================
     VILLE DEMANDÉE
  ======================================================= */

  if (requestedCity) {
    const wantedCity =
      normalizeText(
        requestedCity
      );

    if (
      returnedCity ===
      wantedCity
    ) {
      score += 5000;
    } else if (
      returnedCity.includes(
        wantedCity
      ) ||
      wantedCity.includes(
        returnedCity
      )
    ) {
      score += 1500;
    } else {
      /*
       * Une ville explicitement demandée
       * doit être largement prioritaire.
       */
      score -= 4000;
    }

    /*
     * Si Geoapify et la commune officielle
     * ne correspondent pas, on pénalise.
     */
    if (
      officialCity &&
      geoapifyCity &&
      normalizeText(
        officialCity
      ) !== geoapifyCity
    ) {
      score -= 1500;
    }
  }

  /* =======================================================
     PRIORITÉ IDF
  ======================================================= */

  /*
   * Seulement lorsque l'utilisateur n'a pas
   * indiqué de ville ni de code postal.
   *
   * Cela permet :
   *
   * "32 avenue Victor Hugo"
   *
   * → IDF en priorité.
   *
   * Mais :
   *
   * "32 avenue Victor Hugo Lyon"
   *
   * → Lyon en priorité.
   */

  if (
    !requestedCity &&
    !requestedPostcode
  ) {
    score +=
      getIleDeFrancePriority(
        postcode
      );
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

    const requestedPostcode =
      extractPostcode(text);

    const requestedNumber =
      extractHouseNumber(text);

    /* =====================================================
       1. AUTOCOMPLETE GEOAPIFY
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
       2. RECHERCHE PRÉCISE SI NUMÉRO
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
       3. FUSION
    ===================================================== */

    const features = [
      ...preciseFeatures,
      ...autocompleteFeatures,
    ];

    /* =====================================================
       4. DÉTECTION VILLE DEMANDÉE
    ===================================================== */

    const requestedCity =
      extractRequestedCity(
        text,
        features
      );

    /* =====================================================
       5. DOUBLONS
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
       6. PRÉPARATION
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
       7. VÉRIFICATION DES COMMUNES
    ===================================================== */

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

    /*
     * On limite volontairement les appels
     * aux codes postaux réellement présents
     * dans les résultats.
     */

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
       8. CRÉATION DES SUGGESTIONS
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
              scoreSuggestion({
                feature,
                query: text,
                requestedCity,
                requestedPostcode,
                officialCity,
              }),
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
       9. TRI FINAL
    ===================================================== */

    suggestions.sort(
      (a, b) =>
        b._score -
        a._score
    );

    /* =====================================================
       10. MAXIMUM 6 RÉSULTATS
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

    /* =====================================================
       11. RÉPONSE
    ===================================================== */

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