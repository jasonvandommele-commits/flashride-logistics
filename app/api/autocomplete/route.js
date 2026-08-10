import { NextResponse } from "next/server";

const GEOAPIFY_API_KEY =
  process.env.GEOAPIFY_API_KEY;

/* =========================================================
   NORMALISATION TEXTE
========================================================= */

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/* =========================================================
   NORMALISATION ADRESSE
========================================================= */

function normalizeAddressQuery(text) {
  let value = String(text || "")
    .trim()
    .replace(/\s+/g, " ");

  /*
   * Transforme par exemple :
   *
   * 3rue Marcel
   * 32av Victor Hugo
   * 5bd de la République
   *
   * en :
   *
   * 3 rue Marcel
   * 32 av Victor Hugo
   * 5 bd de la République
   */

  value = value.replace(
    /^(\d+[A-Za-z]?(?:\s*(?:bis|ter|quater))?(?:\s*[-/]\s*\d+[A-Za-z]?)?)\s*(rue|avenue|av|boulevard|bd|chemin|route|place|impasse|allee|allée|cours|quai|square|passage|voie|résidence|residence)\b/i,
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
   CODE POSTAL
========================================================= */

function normalizePostcode(value) {
  return String(value || "")
    .trim();
}

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
   PRIORITÉ GÉOGRAPHIQUE
========================================================= */

function getRegionPriority(postcode) {
  const cp =
    normalizePostcode(postcode);

  if (!/^\d{5}$/.test(cp)) {
    return 0;
  }

  /*
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
   EXTRACTION NUMÉRO
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
   TEXTE DE RECHERCHE SANS NUMÉRO
========================================================= */

function removeHouseNumber(text) {
  return String(text || "")
    .replace(
      /^\s*\d+(?:[A-Za-z])?(?:\s*(?:bis|ter|quater))?(?:\s*[-/]\s*\d+(?:[A-Za-z])?)?\s*/i,
      ""
    )
    .trim();
}

/* =========================================================
   DÉTECTION VILLE
========================================================= */

function queryContainsCity(
  query,
  city
) {
  const normalizedQuery =
    normalizeText(query);

  const normalizedCity =
    normalizeText(city);

  if (
    !normalizedCity ||
    normalizedCity.length < 3
  ) {
    return false;
  }

  /*
   * Évite certaines correspondances
   * trop faibles.
   */

  return normalizedQuery
    .split(" ")
    .includes(normalizedCity);
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
   * Adresse complète
   */

  if (
    houseNumber &&
    street &&
    postcode &&
    city
  ) {
    return `${houseNumber} ${street}, ${postcode} ${city}`;
  }

  /*
   * Adresse avec rue + numéro
   */

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

  /*
   * Fallback Geoapify
   */

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
   SCORE DE PRÉCISION
========================================================= */

function scoreSuggestion(
  feature,
  query
) {
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
      properties.street ||
        properties.address_line1 ||
        ""
    );

  const city =
    getCity(properties);

  const normalizedCity =
    normalizeText(city);

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

  const requestedPostcode =
    extractPostcode(query);

  const postcode =
    normalizePostcode(
      properties.postcode
    );

  const resultType =
    String(
      properties.result_type || ""
    ).toLowerCase();

  let score = 0;

  /* =======================================================
     1. PRIORITÉ IDF
  ======================================================= */

  const regionPriority =
    getRegionPriority(postcode);

  if (
    regionPriority === 4
  ) {
    score += 1800;
  } else if (
    regionPriority === 3
  ) {
    score += 1400;
  } else if (
    regionPriority === 2
  ) {
    score += 1000;
  }

  /*
   * Si aucune ville n'est spécifiée,
   * l'IDF bénéficie d'un bonus supplémentaire.
   */

  const queryHasExplicitPostcode =
    Boolean(
      requestedPostcode
    );

  const queryHasExplicitCity =
    queryContainsCity(
      query,
      city
    );

  if (
    !queryHasExplicitPostcode &&
    !queryHasExplicitCity
  ) {
    if (
      regionPriority === 4
    ) {
      score += 500;
    } else if (
      regionPriority === 3
    ) {
      score += 350;
    } else if (
      regionPriority === 2
    ) {
      score += 200;
    }
  }

  /* =======================================================
     2. VILLE DEMANDÉE
  ======================================================= */

  if (
    queryContainsCity(
      query,
      city
    )
  ) {
    score += 5000;
  }

  /* =======================================================
     3. CODE POSTAL DEMANDÉ
  ======================================================= */

  if (
    requestedPostcode &&
    postcode === requestedPostcode
  ) {
    score += 6000;
  }

  /* =======================================================
     4. NUMÉRO
  ======================================================= */

  if (
    requestedNumber
  ) {
    /*
     * Présence d'un numéro
     */

    if (
      returnedNumber
    ) {
      score += 300;
    }

    /*
     * Numéro exactement identique
     */

    if (
      returnedNumber ===
      requestedNumber
    ) {
      score += 4500;
    }

    /*
     * Numéro au début de l'adresse
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
     5. NOM DE RUE
  ======================================================= */

  const queryWithoutNumber =
    normalizeText(
      removeHouseNumber(query)
    );

  if (
    street &&
    queryWithoutNumber.includes(
      street
    )
  ) {
    score += 1800;
  }

  /*
   * Correspondance partielle utile
   */

  const streetWords =
    street
      .split(" ")
      .filter(
        (word) =>
          word.length >= 3
      );

  for (
    const word of streetWords
  ) {
    if (
      queryWithoutNumber.includes(
        word
      )
    ) {
      score += 100;
    }
  }

  /* =======================================================
     6. ADRESSE COMPLÈTE
  ======================================================= */

  if (
    properties.housenumber ||
    properties.house_number
  ) {
    score += 500;
  }

  if (
    properties.street
  ) {
    score += 400;
  }

  if (
    properties.postcode
  ) {
    score += 400;
  }

  if (
    city
  ) {
    score += 400;
  }

  /*
   * Correspondance exacte du texte
   */

  if (
    formatted.includes(
      normalizedQuery
    )
  ) {
    score += 1200;
  }

  /* =======================================================
     7. TYPE DE RÉSULTAT
  ======================================================= */

  if (
    resultType ===
      "building" ||
    resultType ===
      "house"
  ) {
    score += 900;
  }

  if (
    resultType ===
    "amenity"
  ) {
    score += 500;
  }

  /*
   * Les rues seules ne doivent pas
   * remonter devant les vraies adresses.
   */

  if (
    resultType ===
    "street"
  ) {
    score -= 1500;
  }

  if (
    resultType ===
    "city"
  ) {
    score -= 2500;
  }

  if (
    resultType ===
    "postcode"
  ) {
    score -= 2500;
  }

  /* =======================================================
     8. CONFIANCE GEOAPIFY
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
    score +=
      confidence * 150;
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
      buildingConfidence * 300;
  }

  return score;
}

/* =========================================================
   CLÉ DE DÉDOUBLONNAGE
========================================================= */

function getDuplicateKey(
  feature
) {
  const properties =
    feature.properties || {};

  const coordinates =
    feature.geometry
      ?.coordinates || [];

  const housenumber =
    normalizeText(
      properties.housenumber ||
        properties.house_number ||
        ""
    );

  const street =
    normalizeText(
      properties.street ||
        properties.address_line1 ||
        ""
    );

  const postcode =
    normalizeText(
      properties.postcode ||
        ""
    );

  const city =
    normalizeText(
      getCity(properties)
    );

  /*
   * Une vraie adresse complète :
   *
   * numéro + rue + CP + ville
   *
   * devient une clé unique.
   */

  if (
    housenumber ||
    street ||
    postcode ||
    city
  ) {
    return [
      housenumber,
      street,
      postcode,
      city,
    ].join("|");
  }

  /*
   * Fallback coordonnées.
   */

  return [
    normalizeText(
      properties.formatted
    ),
    coordinates[0] || "",
    coordinates[1] || "",
  ].join("|");
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

  if (
    !response.ok
  ) {
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
    if (
      !GEOAPIFY_API_KEY
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "GEOAPIFY_API_KEY non configurée.",
          suggestions: [],
        },
        {
          status: 500,
        }
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
      rawText.trim()
        .length < 3
    ) {
      return NextResponse.json({
        success: true,
        suggestions: [],
      });
    }

    /*
     * Normalisation générale
     */

    const text =
      normalizeAddressQuery(
        rawText
      );

    const requestedNumber =
      extractHouseNumber(
        text
      );

    const requestedPostcode =
      extractPostcode(
        text
      );

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
    } catch (
      error
    ) {
      console.warn(
        "Autocomplete Geoapify :",
        error?.message
      );
    }

    /* =====================================================
       RECHERCHE PRÉCISE AVEC NUMÉRO
    ===================================================== */

    let preciseFeatures =
      [];

    if (
      requestedNumber
    ) {
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
      } catch (
        error
      ) {
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
       DÉDOUBLONNAGE
    ===================================================== */

    const unique =
      new Map();

    for (
      const feature of features
    ) {
      const key =
        getDuplicateKey(
          feature
        );

      if (
        !unique.has(key)
      ) {
        unique.set(
          key,
          feature
        );
        continue;
      }

      /*
       * Si deux résultats correspondent
       * à la même adresse, on conserve
       * celui qui possède la meilleure
       * confiance Geoapify.
       */

      const existing =
        unique.get(key);

      const existingConfidence =
        Number(
          existing.properties
            ?.rank?.confidence ||
            0
        );

      const currentConfidence =
        Number(
          feature.properties
            ?.rank?.confidence ||
            0
        );

      if (
        currentConfidence >
        existingConfidence
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
        .map(
          (feature) => {
            const properties =
              feature.properties ||
              {};

            const coordinates =
              feature.geometry
                ?.coordinates ||
              [];

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
                .filter(
                  Boolean
                )
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
                coordinates.length >=
                2
                  ? Number(
                      coordinates[1]
                    )
                  : null,

              longitude:
                coordinates.length >=
                2
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
          }
        )
        .filter(
          (item) =>
            item.formatted &&
            item.latitude !==
              null &&
            item.longitude !==
              null &&
            Number.isFinite(
              item.latitude
            ) &&
            Number.isFinite(
              item.longitude
            )
        );

    /* =====================================================
       TRI FINAL
    ===================================================== */

    suggestions.sort(
      (a, b) => {
        /*
         * 1. CODE POSTAL EXPLICITE
         */

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
         * 2. VILLE EXPLICITE
         *
         * Si l'utilisateur écrit une ville,
         * elle doit passer avant la priorité IDF.
         */

        const aCityMatch =
          queryContainsCity(
            text,
            a.city
          );

        const bCityMatch =
          queryContainsCity(
            text,
            b.city
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
         * 3. NUMÉRO EXACT
         */

        if (
          requestedNumber
        ) {
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
            aNumber ===
            requested;

          const bExact =
            bNumber ===
            requested;

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
         * 4. PRIORITÉ IDF
         *
         * Seulement après les critères
         * explicites de l'utilisateur.
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
         * 5. SCORE GLOBAL
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
  } catch (
    error
  ) {
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
      {
        status: 500,
      }
    );
  }
}