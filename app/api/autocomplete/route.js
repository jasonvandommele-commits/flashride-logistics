import { NextResponse } from "next/server";

const GEOAPIFY_API_KEY =
  process.env.GEOAPIFY_API_KEY;

/*
 * Normalise un texte pour faciliter les comparaisons.
 */
function normalize(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,'’]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/*
 * Détecte un numéro de rue au début de la saisie.
 *
 * Exemples :
 * 6 rue ...
 * 12 avenue ...
 * 25 boulevard ...
 * 8A rue ...
 * 10 bis rue ...
 */
function extractNumber(text) {
  const match = text.match(
    /^\s*(\d+[A-Za-z]?)(?:\s*(?:bis|ter|quater))?\s+/i
  );

  return match ? match[1] : "";
}

/*
 * Construit proprement une adresse à partir
 * des données Geoapify.
 */
function formatFeature(feature) {
  const properties =
    feature?.properties || {};

  const coordinates =
    feature?.geometry?.coordinates || [];

  const housenumber = String(
    properties.housenumber || ""
  ).trim();

  const street = String(
    properties.street || ""
  ).trim();

  const postcode = String(
    properties.postcode || ""
  ).trim();

  const city = String(
    properties.city ||
      properties.town ||
      properties.village ||
      properties.municipality ||
      properties.locality ||
      ""
  ).trim();

  /*
   * IMPORTANT :
   * On reconstruit l'adresse nous-mêmes afin
   * de ne pas perdre le numéro de rue.
   */
  let addressLine1 = "";

  if (housenumber && street) {
    addressLine1 =
      `${housenumber} ${street}`;
  } else if (street) {
    addressLine1 = street;
  } else if (
    properties.address_line1
  ) {
    addressLine1 =
      String(
        properties.address_line1
      ).trim();
  }

  const addressLine2 = [
    postcode,
    city,
  ]
    .filter(Boolean)
    .join(" ");

  let formatted = "";

  if (
    addressLine1 &&
    addressLine2
  ) {
    formatted =
      `${addressLine1}, ${addressLine2}`;
  } else if (addressLine1) {
    formatted = addressLine1;
  } else {
    formatted = String(
      properties.formatted || ""
    ).trim();
  }

  return {
    formatted,

    addressLine1,

    addressLine2,

    housenumber,

    street,

    postcode,

    city,

    resultType:
      properties.result_type || "",

    matchType:
      properties.rank?.match_type || "",

    confidence:
      Number(
        properties.rank?.confidence || 0
      ),

    buildingConfidence:
      Number(
        properties.rank
          ?.confidence_building_level || 0
      ),

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
  };
}

/*
 * Vérifie si le résultat possède un numéro.
 */
function hasNumber(result) {
  return Boolean(
    result.housenumber
  );
}

/*
 * Vérifie si le numéro retourné correspond
 * exactement à celui tapé.
 */
function hasExactNumber(
  result,
  requestedNumber
) {
  if (
    !requestedNumber ||
    !result.housenumber
  ) {
    return false;
  }

  return (
    normalize(
      result.housenumber
    ) ===
    normalize(
      requestedNumber
    )
  );
}

/*
 * Appel Geoapify.
 */
async function searchGeoapify(
  endpoint,
  text,
  limit
) {
  const params =
    new URLSearchParams();

  params.set("text", text);
  params.set("limit", String(limit));
  params.set(
    "filter",
    "countrycode:fr"
  );
  params.set("lang", "fr");
  params.set(
    "format",
    "geojson"
  );
  params.set(
    "apiKey",
    GEOAPIFY_API_KEY
  );

  const response =
    await fetch(
      `https://api.geoapify.com/v1/geocode/${endpoint}?${params.toString()}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `Geoapify ${response.status}`
    );
  }

  return Array.isArray(
    data.features
  )
    ? data.features
    : [];
}

export async function GET(
  request
) {
  try {
    /*
     * Vérification de la clé.
     */
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

    const text =
      (
        searchParams.get(
          "text"
        ) || ""
      ).trim();

    /*
     * Pas assez de caractères.
     */
    if (text.length < 3) {
      return NextResponse.json({
        success: true,
        suggestions: [],
      });
    }

    /*
     * Détection du numéro.
     */
    const requestedNumber =
      extractNumber(text);

    /*
     * =====================================================
     * RECHERCHE PRINCIPALE
     * =====================================================
     *
     * On utilise autocomplete pour conserver
     * la rapidité pendant la frappe.
     */
    const autocompleteFeatures =
      await searchGeoapify(
        "autocomplete",
        text,
        8
      );

    let results =
      autocompleteFeatures
        .map(formatFeature)
        .filter(
          (result) =>
            result.formatted
        );

    /*
     * =====================================================
     * SI UN NUMÉRO EST SAISI
     * =====================================================
     *
     * On effectue une seconde recherche uniquement
     * dans ce cas.
     *
     * Cela évite de ralentir les recherches de ville
     * ou de rue.
     */
    if (requestedNumber) {
      const preciseFeatures =
        await searchGeoapify(
          "search",
          text,
          8
        );

      const preciseResults =
        preciseFeatures
          .map(formatFeature)
          .filter(
            (result) =>
              result.formatted
          );

      /*
       * Résultats avec exactement le numéro demandé.
       */
      const exactResults =
        preciseResults.filter(
          (result) =>
            hasExactNumber(
              result,
              requestedNumber
            )
        );

      /*
       * Si Geoapify trouve le numéro exact,
       * on les place en priorité.
       */
      if (
        exactResults.length > 0
      ) {
        results = [
          ...exactResults,
          ...results,
        ];
      } else {
        /*
         * Sinon, on place les résultats possédant
         * quand même un numéro avant les rues seules.
         */
        const numberedResults =
          preciseResults.filter(
            (result) =>
              hasNumber(result)
          );

        results = [
          ...numberedResults,
          ...results,
        ];
      }
    }

    /*
     * =====================================================
     * DÉDOUBLONNAGE
     * =====================================================
     */
    const unique =
      new Map();

    for (const result of results) {
      const key = [
        result.housenumber,
        result.street,
        result.postcode,
        result.city,
      ]
        .map(normalize)
        .join("|");

      if (!unique.has(key)) {
        unique.set(
          key,
          result
        );
      }
    }

    results =
      Array.from(
        unique.values()
      );

    /*
     * =====================================================
     * CLASSEMENT
     * =====================================================
     */
    results.sort(
      (a, b) => {
        /*
         * 1. Numéro exact demandé.
         */
        if (requestedNumber) {
          const aExact =
            hasExactNumber(
              a,
              requestedNumber
            );

          const bExact =
            hasExactNumber(
              b,
              requestedNumber
            );

          if (
            aExact !== bExact
          ) {
            return aExact
              ? -1
              : 1;
          }

          /*
           * 2. Adresse avec numéro
           * avant rue sans numéro.
           */
          const aNumber =
            hasNumber(a);

          const bNumber =
            hasNumber(b);

          if (
            aNumber !== bNumber
          ) {
            return aNumber
              ? -1
              : 1;
          }
        }

        /*
         * 3. Types de résultats.
         */
        const priority = {
          building: 6,
          house: 6,
          address: 5,
          amenity: 4,
          street: 1,
        };

        const aPriority =
          priority[
            String(
              a.resultType
            ).toLowerCase()
          ] || 0;

        const bPriority =
          priority[
            String(
              b.resultType
            ).toLowerCase()
          ] || 0;

        if (
          aPriority !==
          bPriority
        ) {
          return (
            bPriority -
            aPriority
          );
        }

        /*
         * 4. Qualité de correspondance.
         */
        const matchPriority = {
          full_match: 6,
          match_by_building: 5,
          match_by_street: 3,
          match_by_postcode: 2,
          match_by_city_or_district: 1,
        };

        const aMatch =
          matchPriority[
            String(
              a.matchType
            ).toLowerCase()
          ] || 0;

        const bMatch =
          matchPriority[
            String(
              b.matchType
            ).toLowerCase()
          ] || 0;

        if (
          aMatch !== bMatch
        ) {
          return (
            bMatch -
            aMatch
          );
        }

        /*
         * 5. Confiance Geoapify.
         */
        if (
          a.confidence !==
          b.confidence
        ) {
          return (
            b.confidence -
            a.confidence
          );
        }

        return 0;
      }
    );

    /*
     * =====================================================
     * RÉPONSE
     * =====================================================
     */
    return NextResponse.json({
      success: true,

      suggestions:
        results.slice(0, 6),
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