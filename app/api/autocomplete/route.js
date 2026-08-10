import { NextResponse } from "next/server";
const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;
function normalizeAddressQuery(text) {
  let value = text
    .trim()
    .replace(/\s+/g, " ");
  // Transforme :
  // 6rue Delaporte -> 6 rue Delaporte
  // 12avenue Victor Hugo -> 12 avenue Victor Hugo
  // 5boulevard Voltaire -> 5 boulevard Voltaire
  value = value.replace(
    /^(\d+[A-Za-z]?)\s*(rue|avenue|av|boulevard|bd|chemin|route|place|impasse|allee|allée|cours|quai|square|passage)\b/i,
    "$1 $2"
  );
  return value;
}
function getCity(properties) {
  return (
    properties.city ||
    properties.town ||
    properties.village ||
    properties.municipality ||
    ""
  );
}
function buildFormattedAddress(properties) {
  const houseNumber =
    properties.housenumber || "";
  const street =
    properties.street ||
    properties.address_line1 ||
    "";
  const postcode =
    properties.postcode || "";
  const city =
    getCity(properties);
  // PRIORITÉ :
  // numéro + rue + code postal + ville
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
function hasHouseNumber(properties) {
  const houseNumber =
    properties.housenumber || "";
  if (houseNumber) {
    return true;
  }
  const formatted =
    properties.formatted || "";
  const addressLine1 =
    properties.address_line1 || "";
  return (
    /^\s*\d+[A-Za-z]?\s+/.test(
      formatted
    ) ||
    /^\s*\d+[A-Za-z]?\s+/.test(
      addressLine1
    )
  );
}
function calculateScore(properties, query) {
  let score = 0;
  const normalizedQuery =
    query.toLowerCase();
  const formatted = (
    properties.formatted || ""
  ).toLowerCase();
  const street = (
    properties.street || ""
  ).toLowerCase();
  const houseNumber =
    String(
      properties.housenumber || ""
    );
  const resultType =
    properties.result_type || "";
  const rank =
    properties.rank || {};
  // ----------------------------------------
  // 1. NUMÉRO DE RUE
  // ----------------------------------------
  const typedNumberMatch =
    normalizedQuery.match(
      /^(\d+[a-z]?)\s/i
    );
  if (typedNumberMatch) {
    const typedNumber =
      typedNumberMatch[1].toLowerCase();
    if (
      houseNumber.toLowerCase() ===
      typedNumber
    ) {
      score += 1000;
    } else if (
      houseNumber
    ) {
      score += 300;
    } else {
      score -= 300;
    }
  } else if (houseNumber) {
    score += 100;
  }
  // ----------------------------------------
  // 2. TYPE DE RÉSULTAT
  // ----------------------------------------
  if (resultType === "building") {
    score += 250;
  }
  if (resultType === "amenity") {
    score += 180;
  }
  if (resultType === "street") {
    score += 20;
  }
  // ----------------------------------------
  // 3. CONFIANCE GEOAPIFY
  // ----------------------------------------
  if (
    typeof rank.confidence ===
    "number"
  ) {
    score +=
      rank.confidence * 100;
  }
  if (
    typeof rank.confidence_building_level ===
    "number"
  ) {
    score +=
      rank.confidence_building_level *
      150;
  }
  // ----------------------------------------
  // 4. CORRESPONDANCE DU TEXTE
  // ----------------------------------------
  if (
    formatted.includes(
      normalizedQuery
    )
  ) {
    score += 100;
  }
  if (
    street &&
    normalizedQuery.includes(
      street
    )
  ) {
    score += 50;
  }
  return score;
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
        {
          status: 500,
        }
      );
    }
    const { searchParams } =
      new URL(request.url);
    const rawText =
      searchParams.get("text") || "";
    if (
      rawText.trim().length < 3
    ) {
      return NextResponse.json({
        success: true,
        suggestions: [],
      });
    }
    // ----------------------------------------
    // NORMALISATION
    // ----------------------------------------
    const text =
      normalizeAddressQuery(
        rawText
      );
    // ----------------------------------------
    // GEOAPIFY
    // ----------------------------------------
    const url =
      "https://api.geoapify.com/v1/geocode/autocomplete" +
      `?text=${encodeURIComponent(text)}` +
      "&limit=10" +
      "&filter=countrycode:fr" +
      "&lang=fr" +
      "&format=json" +
      `&apiKey=${GEOAPIFY_API_KEY}`;
    const response =
      await fetch(url, {
        method: "GET",
        // Petit cache serveur :
        // améliore les recherches répétées
        next: {
          revalidate: 30,
        },
      });
    const data =
      await response.json();
    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error:
            data?.message ||
            `Erreur Geoapify ${response.status}`,
        },
        {
          status: response.status,
        }
      );
    }
    const features =
      Array.isArray(data.features)
        ? data.features
        : [];
    // ----------------------------------------
    // TRANSFORMATION DES RÉSULTATS
    // ----------------------------------------
    const suggestions =
      features
        .map((feature) => {
          const properties =
            feature.properties || {};
          const coordinates =
            feature.geometry
              ?.coordinates || [];
          const housenumber =
            properties.housenumber ||
            "";
          const street =
            properties.street ||
            "";
          const postcode =
            properties.postcode ||
            "";
          const city =
            getCity(properties);
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
          const formatted =
            buildFormattedAddress(
              properties
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
            hasHouseNumber:
              hasHouseNumber(
                properties
              ),
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
            confidence:
              properties.rank
                ?.confidence ??
              null,
            _score:
              calculateScore(
                properties,
                text
              ),
          };
        })
        .filter(
          (item) =>
            item.formatted
        );
    // ----------------------------------------
    // TRI INTELLIGENT
    // ----------------------------------------
    suggestions.sort(
      (a, b) => {
        // Numéro demandé :
        // priorité ABSOLUE au bon numéro.
        const typedNumberMatch =
          text.match(
            /^(\d+[A-Za-z]?)\s/i
          );
        if (typedNumberMatch) {
          const typedNumber =
            typedNumberMatch[1]
              .toLowerCase();
          const aExact =
            String(
              a.housenumber || ""
            ).toLowerCase() ===
            typedNumber;
          const bExact =
            String(
              b.housenumber || ""
            ).toLowerCase() ===
            typedNumber;
          if (
            aExact !== bExact
          ) {
            return aExact
              ? -1
              : 1;
          }
        }
        // Ensuite présence d'un numéro.
        if (
          a.hasHouseNumber !==
          b.hasHouseNumber
        ) {
          return a.hasHouseNumber
            ? -1
            : 1;
        }
        // Puis score global.
        return (
          b._score -
          a._score
        );
      }
    );
    // ----------------------------------------
    // NETTOYAGE
    // ----------------------------------------
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
          // Le navigateur peut garder
          // brièvement les résultats.
          "Cache-Control":
            "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error(
      "Autocomplete Geoapify:",
      error
    );
    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Erreur pendant l'autocomplétion.",
      },
      {
        status: 500,
      }
    );
  }
}