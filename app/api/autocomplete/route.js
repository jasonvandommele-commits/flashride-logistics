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
   CODE POSTAL
========================================================= */

function normalizePostcode(value) {
  return String(value || "").trim();
}

/* =========================================================
   ZONE GÉOGRAPHIQUE
========================================================= */

function getRegionPriority(postcode) {
  const cp = normalizePostcode(postcode);

  if (!/^\d{5}$/.test(cp)) {
    return 0;
  }

  /*
   * Priorité :
   *
   * 4 = Paris
   * 3 = Petite couronne
   * 2 = Grande couronne
   * 1 = Reste de la France
   */

  if (/^750\d{2}$/.test(cp)) {
    return 4;
  }

  if (/^(92|93|94)\d{3}$/.test(cp)) {
    return 3;
  }

  if (/^(77|78|91|95)\d{3}$/.test(cp)) {
    return 2;
  }

  return 1;
}

/* =========================================================
   DÉTECTION VILLE / CODE POSTAL DANS LA REQUÊTE
========================================================= */

function extractPostcode(text) {
  const match = String(text || "").match(
    /\b(\d{5})\b/
  );

  return match ? match[1] : "";
}

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/*
 * Détecte si l'utilisateur a explicitement indiqué
 * une ville dans sa recherche.
 *
 * Exemple :
 * "32 avenue Victor Hugo Paris"
 *
 * Ici "Paris" doit avoir priorité sur la règle
 * générale Paris / IDF.
 */

function queryContainsCity(
  query,
  properties
) {
  const normalizedQuery =
    normalizeText(query);

  const city =
    normalizeText(
      getCity(properties)
    );

  if (!city) {
    return false;
  }

  if (city.length < 3) {
    return false;
  }

  return normalizedQuery.includes(city);
}

/* =========================================================
   NUMÉRO
========================================================= */

function extractHouseNumber(text) {
  const match =
    String(text || "").match(
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

function buildFormattedAddress(
  properties
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
    properties.postcode ||
    "";

  const city =
    getCity(properties);

  /*
   * Adresse complète :
   *
   * 32 avenue Victor Hugo,
   * 75016 Paris
   */

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
  query
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

  const normalizedQuery =
    normalizeText(query);

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

  let score = 0;

  /* =======================================================
     1. PRIORITÉ RÉGIONALE
  ======================================================= */

  const regionPriority =
    getRegionPriority(postcode);

  /*
   * Très important :
   *
   * On ne veut pas simplement mettre Paris
   * devant tout le reste.
   *
   * On veut :
   *
   * Paris
   * ↓
   * Petite couronne
   * ↓
   * Grande couronne
   * ↓
   * Reste France
   *
   * Mais la précision de l'adresse reste importante.
   */

  if (regionPriority === 4) {
    score += 1800;
  } else if (
    regionPriority === 3
  ) {
    score += 1400;
  } else if (
    regionPriority === 2
  ) {
    score += 1000;
  } else if (
    regionPriority === 1
  ) {
    score += 0;
  }

  /* =======================================================
     2. VILLE EXPLICITEMENT DEMANDÉE
  ======================================================= */

  /*
   * Si l'utilisateur écrit :
   *
   * "32 avenue Victor Hugo Paris"
   *
   * on doit respecter Paris.
   *
   * Même chose pour :
   *
   * "10 rue Marcel Lyon"
   * "5 rue de la République Lille"
   *
   * etc.
   */

  if (
    queryContainsCity(
      query,
      properties
    )
  ) {
    score += 5000;
  }

  /* =======================================================
     3. CODE POSTAL EXPLICITEMENT DEMANDÉ
  ======================================================= */

  const requestedPostcode =
    extractPostcode(query);

  if (
    requestedPostcode &&
    postcode === requestedPostcode
  ) {
    score += 6000;
  }

  /* =======================================================
     4. NUMÉRO
  ======================================================= */

  if (requestedNumber) {
    if (returnedNumber) {
      score += 300;
    }

    /*
     * Correspondance exacte :
     *
     * 32 demandé
     * 32 retourné
     */

    if (
      returnedNumber ===
      requestedNumber
    ) {
      score += 4000;
    }

    /*
     * Le numéro apparaît réellement
     * au début de l'adresse.
     */

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
      score += 800;
    }
  }

  /* =======================================================
     5. TYPE DE RÉSULTAT
  ======================================================= */

  /*
   * On veut une adresse réelle.
   */

  if (
    resultType === "building" ||
    resultType === "house"
  ) {
    score += 700;
  }

  if (
    resultType === "amenity"
  ) {
    score += 400;
  }

  /*
   * Les rues seules doivent être
   * moins prioritaires.
   */

  if (
    resultType === "street"
  ) {
    score -= 1200;
  }

  if (
    resultType === "city"
  ) {
    score -= 2000;
  }

  if (
    resultType === "postcode"
  ) {
    score -= 2000;
  }

  /* =======================================================
     6. ADRESSE COMPLÈTE
  ======================================================= */

  if (
    properties.postcode &&
    getCity(properties)
  ) {
    score += 500;
  }

  if (
    properties.housenumber ||
    properties.house_number
  ) {
    score += 500;
  }

  if (
    properties.street
  ) {
    score += 300;
  }

  /* =======================================================
     7. CONFIANCE GEOAPIFY
  ======================================================= */

  const confidence =
    Number(
      properties.rank?.confidence
    );

  if (
    Number.isFinite(
      confidence
    )
  ) {
    score += confidence * 150;
  }

  const buildingConfidence =
    Number(
      properties.rank
        ?.confidence_building_level
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
     8. CORRESPONDANCE RUE
  ======================================================= */

  /*
   * On retire les espaces et accents
   * uniquement pour comparer les textes.
   */

  const queryWithoutNumber =
    normalizedQuery.replace(
      /^\d+(?:[a-z])?(?:\s*(?:bis|ter|quater))?\s*/i,
      ""
    );

  if (
    street &&
    queryWithoutNumber.includes(
      street
    )
  ) {
    score += 1000;
  }

  if (
    formatted.includes(
      normalizedQuery
    )
  ) {
    score += 1200;
  }

  /* =======================================================
     9. PÉNALITÉ POUR RÉSULTAT TRÈS ÉLOIGNÉ
  ======================================================= */

  /*
   * Si aucune ville n'est indiquée,
   * la priorité IDF est volontaire.
   *
   * Mais on ne détruit pas complètement
   * la pertinence Geoapify.
   */

  if (
    !requestedPostcode &&
    !queryContainsCity(
      query,
      properties
    )
  ) {
    if (regionPriority === 4) {
      score += 500;
    }

    if (regionPriority === 3) {
      score += 350;
    }

    if (regionPriority === 2) {
      score += 200;
    }
  }

  return score;
}

/* =========================================================
   FETCH GEOAPIFY
========================================================= */

async function fetchGeoapify(
  url
) {
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

export async function GET(
  request
) {
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

    const {
      searchParams,
    } = new URL(
      request.url
    );

    const rawText =
      searchParams.get(
        "text"
      ) || "";

    if (
      rawText.trim().length < 3
    ) {
      return NextResponse.json({
        success: true,
        suggestions: [],
      });
    }

    /*
     * Exemple :
     *
     * 10Rue Marcel
     * devient
     * 10 Rue Marcel
     */

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
      "&limit=15" +
      "&filter=countrycode:fr" +
      "&lang=fr" +
      `&apiKey=${GEOAPIFY_API_KEY}`;

    let autocompleteFeatures =
      [];

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
        "&limit=15" +
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

    const unique =
      new Map();

    for (
      const feature of features
    ) {
      const properties =
        feature.properties ||
        {};

      const coordinates =
        feature.geometry
          ?.coordinates || [];

      const key =
        properties.place_id ||
        [
          properties.formatted ||
            "",
          coordinates[0] || "",
          coordinates[1] || "",
        ].join("|");

      if (
        !unique.has(key)
      ) {
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
            getCity(
              properties
            );

          const formatted =
            buildFormattedAddress(
              properties
            );

          const addressLine1 =
            housenumber &&
            street
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

            _regionPriority:
              getRegionPriority(
                postcode
              ),

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
            item.latitude !==
              null &&
            item.longitude !==
              null
        );

    /* =====================================================
       TRI FINAL
    ===================================================== */

    suggestions.sort(
      (a, b) => {
        /*
         * Si l'utilisateur a explicitement
         * donné un code postal, la correspondance
         * exacte passe avant tout.
         */

        const requestedPostcode =
          extractPostcode(
            text
          );

        if (
          requestedPostcode
        ) {
          const aExact =
            a.postcode ===
            requestedPostcode;

          const bExact =
            b.postcode ===
            requestedPostcode;

          if (
            aExact !==
            bExact
          ) {
            return aExact
              ? -1
              : 1;
          }
        }

        /*
         * Si l'utilisateur a indiqué une ville,
         * la ville correspondante doit être prioritaire.
         */

        const aCityMatch =
          queryContainsCity(
            text,
            {
              city:
                a.city,
            }
          );

        const bCityMatch =
          queryContainsCity(
            text,
            {
              city:
                b.city,
            }
          );

        if (
          aCityMatch !==
          bCityMatch
        ) {
          return aCityMatch
            ? -1
            : 1;
        }

        /*
         * Ensuite :
         *
         * Paris
         * Petite couronne
         * Grande couronne
         * France
         */

        if (
          a._regionPriority !==
          b._regionPriority
        ) {
          return (
            b._regionPriority -
            a._regionPriority
          );
        }

        /*
         * Ensuite seulement le score
         * global de pertinence.
         */

        return (
          b._score -
          a._score
        );
      }
    );

    /* =====================================================
       RÉSULTAT FINAL
    ===================================================== */

    const finalSuggestions =
      suggestions
        .slice(0, 6)
        .map(
          ({
            _score,
            _regionPriority,
            ...suggestion
          }) =>
            suggestion
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