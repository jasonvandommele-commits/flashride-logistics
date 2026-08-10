import { NextResponse } from "next/server";

const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;

function normalizeText(value = "") {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[,\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractHouseNumber(text = "") {
  const match = text.trim().match(/^(\d+[A-Za-z]?)\b/);
  return match ? match[1].toLowerCase() : null;
}

export async function GET(request) {
  try {
    if (!GEOAPIFY_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "GEOAPIFY_API_KEY non configurée.",
        },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const text = (searchParams.get("text") || "").trim();

    if (text.length < 3) {
      return NextResponse.json({
        success: true,
        suggestions: [],
      });
    }

    const userNumber = extractHouseNumber(text);
    const normalizedQuery = normalizeText(text);

    const url =
      "https://api.geoapify.com/v1/geocode/autocomplete" +
      `?text=${encodeURIComponent(text)}` +
      "&limit=15" +
      "&filter=countrycode:fr" +
      "&lang=fr" +
      `&apiKey=${GEOAPIFY_API_KEY}`;

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error:
            data?.message ||
            `Erreur Geoapify ${response.status}`,
        },
        { status: response.status }
      );
    }

    const features = Array.isArray(data.features)
      ? data.features
      : [];

    const suggestions = features
      .map((feature) => {
        const properties = feature.properties || {};
        const coordinates =
          feature.geometry?.coordinates || [];

        const housenumber =
          properties.housenumber ||
          properties.house_number ||
          "";

        const street =
          properties.street ||
          "";

        const postcode =
          properties.postcode ||
          "";

        const city =
          properties.city ||
          properties.town ||
          properties.village ||
          properties.municipality ||
          "";

        const resultType =
          properties.result_type ||
          "";

        /*
         * On reconstruit nous-mêmes l'adresse.
         * Cela évite de dépendre uniquement de
         * properties.formatted qui peut parfois
         * renvoyer uniquement la rue.
         */
        const addressLine1 = [
          housenumber,
          street,
        ]
          .filter(Boolean)
          .join(" ");

        const addressLine2 = [
          postcode,
          city,
        ]
          .filter(Boolean)
          .join(" ");

        const formatted =
          [addressLine1, addressLine2]
            .filter(Boolean)
            .join(", ") ||
          properties.formatted ||
          "";

        const normalizedStreet = normalizeText(street);
        const normalizedFormatted =
          normalizeText(formatted);

        const hasHouseNumber =
          Boolean(housenumber) ||
          new RegExp(
            `^${userNumber || "\\d+"}\\b`
          ).test(normalizedFormatted);

        /*
         * Correspondance exacte du numéro saisi.
         *
         * Exemple :
         * utilisateur : 6 rue Delaporte
         *
         * résultat avec 6 -> très fortement favorisé
         * résultat avec 5 -> défavorisé
         */
        const exactHouseNumber =
          userNumber &&
          housenumber &&
          housenumber.toLowerCase() ===
            userNumber;

        /*
         * Vérification que la rue recherchée
         * apparaît bien dans le résultat.
         */
        const queryWords = normalizedQuery
          .split(" ")
          .filter(
            (word) =>
              word.length >= 3 &&
              !/^\d+[a-z]?$/.test(word)
          );

        const streetMatchesQuery =
          queryWords.length === 0 ||
          queryWords.some(
            (word) =>
              normalizedStreet.includes(word) ||
              normalizedFormatted.includes(word)
          );

        return {
          formatted,
          addressLine1,
          addressLine2,
          postcode,
          city,
          housenumber,
          street,
          resultType,
          hasHouseNumber,
          exactHouseNumber:
            Boolean(exactHouseNumber),
          streetMatchesQuery,
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
        };
      })
      .filter(
        (item) =>
          item.formatted &&
          item.streetMatchesQuery
      );

    /*
     * Classement intelligent.
     *
     * Plus le score est élevé,
     * plus le résultat est pertinent.
     */
    const rankedSuggestions = suggestions
      .map((item) => {
        let score = 0;

        // Numéro exact demandé
        if (
          userNumber &&
          item.exactHouseNumber
        ) {
          score += 1000;
        }

        // L'utilisateur a saisi un numéro :
        // les résultats avec numéro passent devant
        if (
          userNumber &&
          item.hasHouseNumber
        ) {
          score += 500;
        }

        // Une adresse sans numéro est moins intéressante
        if (
          userNumber &&
          !item.hasHouseNumber
        ) {
          score -= 500;
        }

        // Types intéressants
        if (
          item.resultType === "building" ||
          item.resultType === "house"
        ) {
          score += 100;
        }

        if (item.resultType === "amenity") {
          score += 50;
        }

        if (item.resultType === "street") {
          score -= 100;
        }

        // Présence d'un code postal
        if (item.postcode) {
          score += 20;
        }

        // Présence d'une ville
        if (item.city) {
          score += 20;
        }

        return {
          ...item,
          score,
        };
      })
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        return a.formatted.localeCompare(
          b.formatted
        );
      });

    return NextResponse.json(
      {
        success: true,
        suggestions:
          rankedSuggestions.slice(0, 6),
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