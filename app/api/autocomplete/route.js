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
   NORMALISATION TEXTE
========================================================= */

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,;:!?()[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
   VILLE DEMANDÉE
========================================================= */

function extractRequestedCity(text) {
  const normalized = normalizeText(text);

  /*
   * Liste des villes / communes courantes.
   * On cherche surtout une ville explicitement écrite
   * après la rue ou le numéro.
   */
  const knownCities = [
    "paris",
    "boulogne billancourt",
    "boulogne-billancourt",
    "maisons alfort",
    "maisons-alfort",
    "creteil",
    "créteil",
    "ivry sur seine",
    "ivry-sur-seine",
    "vitry sur seine",
    "vitry-sur-seine",
    "saint denis",
    "saint-denis",
    "montreuil",
    "versailles",
    "argenteuil",
    "nanterre",
    "courbevoie",
    "colombes",
    "neuilly sur seine",
    "neuilly-sur-seine",
    "levallois perret",
    "levallois-perret",
    "champigny sur marne",
    "champigny-sur-marne",
    "noisy le grand",
    "noisy-le-grand",
    "rueil malmaison",
    "rueil-malmaison",
    "cergy",
    "evry",
    "évry",
    "melun",
    "meaux",
    "pontoise",
    "sarcelles",
    "drancy",
    "aubervilliers",
    "asnieres sur seine",
    "asnières-sur-seine",
    "gennevilliers",
    "clichy",
    "saint maur des fosses",
    "saint-maur-des-fosses",
    "fontenay sous bois",
    "fontenay-sous-bois",
    "antony",
    "clamart",
    "malakoff",
    "montrouge",
    "bagnolet",
    "pantin",
    "bobigny",
    "sevran",
    "aeroport",
  ];

  /*
   * On teste les noms les plus longs en premier.
   */
  const sortedCities = [...knownCities].sort(
    (a, b) => b.length - a.length
  );

  for (const city of sortedCities) {
    const normalizedCity = normalizeText(city);

    if (
      normalized.includes(normalizedCity)
    ) {
      return city;
    }
  }

  return "";
}

/* =========================================================
   CODE POSTAL COHÉRENT AVEC LA VILLE
========================================================= */

function isParisPostcode(postcode) {
  return /^750\d{2}$/.test(
    String(postcode || "").trim()
  );
}

function postcodeMatchesCity(
  postcode,
  requestedCity
) {
  const cp = String(postcode || "").trim();

  const city = normalizeText(
    requestedCity
  );

  if (!cp || !city) {
    return false;
  }

  if (city === "paris") {
    return isParisPostcode(cp);
  }

  /*
   * Pour les autres villes, on ne peut pas
   * déduire systématiquement un code postal
   * avec certitude. On laisse donc Geoapify
   * déterminer la correspondance.
   */
  return false;
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

function scoreSuggestion(
  feature,
  query,
  requestedCity
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

  const city =
    normalizeText(
      getCity(properties)
    );

  const requestedCityNormalized =
    normalizeText(
      requestedCity
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

  const postcode =
    String(
      properties.postcode || ""
    ).trim();

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
  }

  /* =======================================================
     VILLE
  ======================================================= */

  if (
    requestedCityNormalized
  ) {
    if (
      city ===
      requestedCityNormalized
    ) {
      /*
       * Très grosse priorité.
       */
      score += 5000;
    } else if (
      city.includes(
        requestedCityNormalized
      ) ||
      requestedCityNormalized.includes(
        city
      )
    ) {
      score += 1500;
    } else {
      /*
       * L'utilisateur a demandé
       * une ville précise mais le résultat
       * appartient à une autre ville.
       */
      score -= 3000;
    }

    /*
     * Cas particulier Paris.
     */
    if (
      requestedCityNormalized ===
      "paris"
    ) {
      if (
        isParisPostcode(
          postcode
        )
      ) {
        score += 2500;
      } else {
        score -= 4000;
      }
    }
  }

  /* =======================================================
     TYPE
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
    properties.postcode &&
    getCity(properties)
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
      buildingConfidence * 150;
  }

  /* =======================================================
     RUE
  ======================================================= */

  const normalizedQuery =
    normalizeText(query);

  if (
    formatted.includes(
      normalizedQuery
    )
  ) {
    score += 500;
  }

  if (
    street &&
    normalizedQuery.includes(
      street
    )
  ) {
    score += 250;
  }

  /* =======================================================
     CODE POSTAL PARIS
  ======================================================= */

  if (
    requestedCityNormalized ===
      "paris" &&
    postcodeMatchesCity(
      postcode,
      requestedCity
    )
  ) {
    score += 2000;
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

    const requestedCity =
      extractRequestedCity(
        text
      );

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
       FUSION
    ===================================================== */

    const unique = new Map();

    for (
      const feature of
      autocompleteFeatures
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
          coordinates[0] ||
            "",
          coordinates[1] ||
            "",
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
              getCity(properties);

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

              _score:
                scoreSuggestion(
                  feature,
                  text,
                  requestedCity
                ),
            };
          }
        )
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
      (a, b) => {
        /*
         * 1. Ville exacte
         */
        if (
          requestedCity
        ) {
          const wantedCity =
            normalizeText(
              requestedCity
            );

          const aCity =
            normalizeText(
              a.city
            );

          const bCity =
            normalizeText(
              b.city
            );

          const aExactCity =
            aCity ===
            wantedCity;

          const bExactCity =
            bCity ===
            wantedCity;

          if (
            aExactCity !==
            bExactCity
          ) {
            return aExactCity
              ? -1
              : 1;
          }

          /*
           * Si Paris est demandé,
           * un 750xx passe devant
           * tout autre code postal.
           */
          if (
            wantedCity ===
            "paris"
          ) {
            const aParis =
              isParisPostcode(
                a.postcode
              );

            const bParis =
              isParisPostcode(
                b.postcode
              );

            if (
              aParis !==
              bParis
            ) {
              return aParis
                ? -1
                : 1;
            }
          }
        }

        /*
         * 2. Numéro exact
         */
        if (
          requestedNumber
        ) {
          const wanted =
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
            aNumber === wanted;

          const bExact =
            bNumber === wanted;

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
         * 3. Score global
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