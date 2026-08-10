import { NextResponse } from "next/server";

const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;

function normalizeText(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,'’]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractStreetNumber(text) {
  /*
   * Détecte :
   * 6 rue Delaporte
   * 6rue Delaporte
   * 6 bis rue Delaporte
   * 6A rue Delaporte
   */
  const match = text.match(
    /^\s*(\d+[A-Za-z]?)(?:\s*(?:bis|ter|quater))?\s+/i
  );

  return match ? match[1].trim() : "";
}

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

function buildAddress(feature) {
  const properties = feature.properties || {};

  const houseNumber = String(
    properties.housenumber || ""
  ).trim();

  const street = String(
    properties.street || ""
  ).trim();

  const postcode = String(
    properties.postcode || ""
  ).trim();

  const city = String(
    getCity(properties)
  ).trim();

  const addressLine1 =
    houseNumber && street
      ? `${houseNumber} ${street}`
      : String(
          properties.address_line1 ||
            street ||
            ""
        ).trim();

  const addressLine2 = [
    postcode,
    city,
  ]
    .filter(Boolean)
    .join(" ");

  let formatted = "";

  if (addressLine1 && addressLine2) {
    formatted = `${addressLine1}, ${addressLine2}`;
  } else if (addressLine1) {
    formatted = addressLine1;
  } else {
    formatted = String(
      properties.formatted || ""
    ).trim();
  }

  const coordinates =
    feature.geometry?.coordinates || [];

  return {
    formatted,
    addressLine1,
    addressLine2,

    postcode,
    city,

    housenumber: houseNumber,
    street,

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

function hasNumber(address) {
  return Boolean(
    address.housenumber
  );
}

function numberMatches(
  address,
  requestedNumber
) {
  if (
    !requestedNumber ||
    !address.housenumber
  ) {
    return false;
  }

  return (
    normalizeText(
      address.housenumber
    ) ===
    normalizeText(requestedNumber)
  );
}

function streetMatches(
  address,
  requestedStreet
) {
  if (
    !address.street ||
    !requestedStreet
  ) {
    return false;
  }

  const a = normalizeText(
    address.street
  );

  const b = normalizeText(
    requestedStreet
  );

  return (
    a === b ||
    a.includes(b) ||
    b.includes(a)
  );
}

async function geoapifyRequest(
  endpoint,
  params
) {
  const searchParams =
    new URLSearchParams({
      ...params,
      apiKey: GEOAPIFY_API_KEY,
    });

  const url =
    `https://api.geoapify.com/v1/geocode/${endpoint}?${searchParams.toString()}`;

  const response = await fetch(url, {
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

    const text = (
      searchParams.get("text") || ""
    ).trim();

    if (text.length < 3) {
      return NextResponse.json({
        success: true,
        suggestions: [],
      });
    }

    /*
     * =====================================================
     * 1. RECHERCHE AUTOCOMPLETE RAPIDE
     * =====================================================
     */

    const autocompletePromise =
      geoapifyRequest(
        "autocomplete",
        {
          text,
          limit: "8",
          filter: "countrycode:fr",
          lang: "fr",
          format: "geojson",
        }
      );

    /*
     * =====================================================
     * 2. DÉTECTION D'UN NUMÉRO
     * =====================================================
     */

    const requestedNumber =
      extractStreetNumber(text);

    /*
     * Si l'utilisateur a tapé un numéro,
     * on essaie de séparer :
     *
     * 6 rue Delaporte Maisons-Alfort
     *
     * en :
     *
     * numéro = 6
     * reste = rue Delaporte Maisons-Alfort
     */
    let preciseSearchPromise =
      Promise.resolve(null);

    if (requestedNumber) {
      const remainingText =
        text
          .replace(
            /^\s*\d+[A-Za-z]?(?:\s*(?:bis|ter|quater))?\s*/i,
            ""
          )
          .trim();

      /*
       * Recherche directe avec le texte complet.
       *
       * On utilise /search en complément de
       * /autocomplete car cette recherche est beaucoup
       * plus adaptée à une adresse précise.
       */
      preciseSearchPromise =
        geoapifyRequest(
          "search",
          {
            text,
            limit: "10",
            filter: "countrycode:fr",
            lang: "fr",
            format: "geojson",
          }
        ).catch(() => null);

      /*
       * Si la première recherche ne donne rien,
       * on fera une recherche complémentaire
       * avec le texte sans le numéro.
       */
      if (remainingText) {
        preciseSearchPromise =
          Promise.all([
            preciseSearchPromise,
            geoapifyRequest(
              "search",
              {
                text: remainingText,
                limit: "10",
                filter: "countrycode:fr",
                lang: "fr",
                format: "geojson",
              }
            ).catch(() => null),
          ]);
      }
    }

    const [
      autocompleteData,
      preciseData,
    ] = await Promise.all([
      autocompletePromise,
      preciseSearchPromise,
    ]);

    /*
     * =====================================================
     * AUTOCOMPLETE
     * =====================================================
     */

    const autocompleteFeatures =
      Array.isArray(
        autocompleteData?.features
      )
        ? autocompleteData.features
        : [];

    let autocompleteResults =
      autocompleteFeatures
        .map(buildAddress)
        .filter(
          (item) => item.formatted
        );

    /*
     * =====================================================
     * RECHERCHE PRÉCISE
     * =====================================================
     */

    let preciseFeatures = [];

    if (Array.isArray(preciseData)) {
      for (const result of preciseData) {
        if (
          Array.isArray(
            result?.features
          )
        ) {
          preciseFeatures.push(
            ...result.features
          );
        }
      }
    } else if (
      Array.isArray(
        preciseData?.features
      )
    ) {
      preciseFeatures =
        preciseData.features;
    }

    const preciseResults =
      preciseFeatures
        .map(buildAddress)
        .filter(
          (item) => item.formatted
        );

    /*
     * =====================================================
     * SI NUMÉRO SAISI :
     * ON PRIVILÉGIE LES VRAIES ADRESSES
     * =====================================================
     */

    if (requestedNumber) {
      /*
       * Résultats de recherche précise avec
       * exactement le numéro demandé.
       */
      const exactPrecise =
        preciseResults.filter(
          (item) =>
            numberMatches(
              item,
              requestedNumber
            )
        );

      /*
       * Si on trouve le numéro exact,
       * on utilise uniquement ces résultats
       * en priorité.
       */
      if (exactPrecise.length > 0) {
        autocompleteResults =
          exactPrecise;
      } else {
        /*
         * Sinon on cherche un résultat contenant
         * n'importe quel numéro.
         */
        const numberedPrecise =
          preciseResults.filter(
            (item) =>
              hasNumber(item)
          );

        if (
          numberedPrecise.length > 0
        ) {
          autocompleteResults =
            numberedPrecise;
        }
      }
    }

    /*
     * =====================================================
     * DÉDOUBLONNAGE
     * =====================================================
     */

    const unique = new Map();

    for (const item of autocompleteResults) {
      const key = [
        item.housenumber,
        item.street,
        item.postcode,
        item.city,
      ]
        .map(normalizeText)
        .join("|");

      if (!unique.has(key)) {
        unique.set(key, item);
      }
    }

    let suggestions =
      Array.from(unique.values());

    /*
     * =====================================================
     * CLASSEMENT
     * =====================================================
     */

    suggestions.sort((a, b) => {
      /*
       * Numéro exact demandé.
       */
      if (requestedNumber) {
        const aExact =
          numberMatches(
            a,
            requestedNumber
          );

        const bExact =
          numberMatches(
            b,
            requestedNumber
          );

        if (aExact !== bExact) {
          return aExact ? -1 : 1;
        }

        /*
         * Tout résultat avec numéro avant
         * une rue sans numéro.
         */
        const aHasNumber =
          hasNumber(a);

        const bHasNumber =
          hasNumber(b);

        if (
          aHasNumber !==
          bHasNumber
        ) {
          return aHasNumber ? -1 : 1;
        }
      }

      /*
       * Type de résultat.
       */
      const typePriority = {
        building: 6,
        house: 6,
        amenity: 5,
        address: 5,
        street: 1,
      };

      const aType =
        typePriority[
          String(
            a.resultType
          ).toLowerCase()
        ] || 0;

      const bType =
        typePriority[
          String(
            b.resultType
          ).toLowerCase()
        ] || 0;

      if (aType !== bType) {
        return bType - aType;
      }

      /*
       * Match type.
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

      if (aMatch !== bMatch) {
        return bMatch - aMatch;
      }

      /*
       * Confiance.
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
    });

    /*
     * =====================================================
     * FALLBACK
     * =====================================================
     *
     * Si une recherche précise n'a rien donné,
     * on conserve les suggestions autocomplete.
     */

    if (
      suggestions.length === 0
    ) {
      suggestions =
        autocompleteFeatures
          .map(buildAddress)
          .filter(
            (item) =>
              item.formatted
          );
    }

    /*
     * Maximum 6 suggestions.
     */
    suggestions =
      suggestions.slice(0, 6);

    return NextResponse.json({
      success: true,
      suggestions,
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