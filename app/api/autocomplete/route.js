import { NextResponse } from "next/server";
const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;
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
function normalize(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}
function hasStreetNumber(text) {
  return /^\s*\d+[A-Za-z]?(?:\s+(?:bis|ter|quater))?\s+/i.test(
    text
  );
}
function formatSuggestion(feature) {
  const properties = feature?.properties || {};
  const coordinates = feature?.geometry?.coordinates || [];
  const housenumber = String(
    properties.housenumber || ""
  ).trim();
  const street = String(
    properties.street || ""
  ).trim();
  const postcode = String(
    properties.postcode || ""
  ).trim();
  const city = String(getCity(properties)).trim();
  /*
   * On reconstruit l'adresse nous-mêmes.
   * Cela évite que "formatted" perde le numéro.
   */
  let addressLine1 = "";
  if (housenumber && street) {
    addressLine1 = `${housenumber} ${street}`;
  } else if (properties.address_line1) {
    addressLine1 = String(
      properties.address_line1
    ).trim();
  } else if (street) {
    addressLine1 = street;
  }
  const addressLine2 = [postcode, city]
    .filter(Boolean)
    .join(" ");
  const formatted =
    addressLine1 && addressLine2
      ? `${addressLine1}, ${addressLine2}`
      : addressLine1 ||
        properties.formatted ||
        "";
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
async function geoapifySearch(
  endpoint,
  text
) {
  const params = new URLSearchParams();
  params.set("text", text);
  params.set("limit", "6");
  params.set("filter", "countrycode:fr");
  params.set("lang", "fr");
  params.set("format", "geojson");
  params.set("apiKey", GEOAPIFY_API_KEY);
  const response = await fetch(
    `https://api.geoapify.com/v1/geocode/${endpoint}?${params.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      data?.message ||
        `Geoapify ${response.status}`
    );
  }
  return Array.isArray(data.features)
    ? data.features
    : [];
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
     * IMPORTANT :
     *
     * Sans numéro :
     * autocomplete = rapide pour les villes/rues.
     *
     * Avec numéro :
     * search = beaucoup plus adapté à une
     * adresse précise.
     *
     * Une seule requête est effectuée.
     */
    const endpoint = hasStreetNumber(text)
      ? "search"
      : "autocomplete";
    const features = await geoapifySearch(
      endpoint,
      text
    );
    let suggestions = features
      .map(formatSuggestion)
      .filter(
        (item) => item.formatted
      );
    /*
     * Si l'utilisateur a saisi un numéro,
     * les résultats avec numéro passent devant
     * les rues seules.
     */
    if (hasStreetNumber(text)) {
      suggestions.sort((a, b) => {
        const aHasNumber =
          Boolean(a.housenumber);
        const bHasNumber =
          Boolean(b.housenumber);
        if (
          aHasNumber !== bHasNumber
        ) {
          return aHasNumber ? -1 : 1;
        }
        /*
         * Les bâtiments/adresses sont prioritaires
         * par rapport aux rues.
         */
        const priority = {
          building: 5,
          house: 5,
          address: 5,
          amenity: 4,
          street: 1,
        };
        const aPriority =
          priority[
            normalize(a.resultType)
          ] || 0;
        const bPriority =
          priority[
            normalize(b.resultType)
          ] || 0;
        if (
          aPriority !== bPriority
        ) {
          return bPriority - aPriority;
        }
        return (
          b.confidence -
          a.confidence
        );
      });
    }
    /*
     * Suppression des doublons.
     */
    const unique = new Map();
    for (const suggestion of suggestions) {
      const key = [
        suggestion.housenumber,
        suggestion.street,
        suggestion.postcode,
        suggestion.city,
      ]
        .map(normalize)
        .join("|");
      if (!unique.has(key)) {
        unique.set(key, suggestion);
      }
    }
    suggestions = Array.from(
      unique.values()
    ).slice(0, 6);
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