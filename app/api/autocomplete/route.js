import { NextResponse } from "next/server";

const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;

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

    /*
     * Détection du numéro de rue saisi.
     *
     * Exemples :
     * 6 rue Delaporte
     * 6rue Delaporte
     * 6 bis rue Delaporte
     * 6A rue Delaporte
     */
    const numberMatch = text.match(
      /^\s*(\d+[A-Za-z]?)(?:\s+|[,;-]|\s*)/i
    );

    const userTypedNumber = Boolean(numberMatch);

    const typedNumber = numberMatch
      ? numberMatch[1].toLowerCase()
      : "";

    /*
     * Recherche Geoapify.
     */
    const url =
      "https://api.geoapify.com/v1/geocode/autocomplete" +
      `?text=${encodeURIComponent(text)}` +
      "&limit=10" +
      "&filter=countrycode:fr" +
      "&lang=fr" +
      "&format=geojson" +
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
          properties.city ||
            properties.town ||
            properties.village ||
            properties.municipality ||
            ""
        ).trim();

        /*
         * On reconstruit nous-mêmes l'adresse.
         *
         * C'est important car Geoapify peut parfois
         * retourner un "formatted" sans le numéro alors
         * que "housenumber" contient bien le numéro.
         */
        let addressLine1 = "";

        if (houseNumber && street) {
          addressLine1 = `${houseNumber} ${street}`;
        } else if (properties.address_line1) {
          addressLine1 =
            String(properties.address_line1).trim();
        } else if (street) {
          addressLine1 = street;
        }

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
        } else if (properties.formatted) {
          formatted =
            String(properties.formatted).trim();
        }

        /*
         * Vérification du numéro présent dans formatted.
         */
        const formattedHasNumber =
          /^\s*\d+[A-Za-z]?(?:\s|,|-)/.test(
            formatted
          );

        const hasHouseNumber =
          Boolean(houseNumber) ||
          formattedHasNumber;

        /*
         * Le numéro retourné correspond-il exactement
         * au numéro demandé ?
         */
        const normalizedReturnedNumber =
          houseNumber.toLowerCase();

        const numberMatches =
          userTypedNumber &&
          normalizedReturnedNumber === typedNumber;

        /*
         * Deuxième vérification directement dans
         * l'adresse affichée.
         */
        const formattedContainsTypedNumber =
          userTypedNumber &&
          new RegExp(
            `(^|\\s|,)${typedNumber}(\\s|,|$)`,
            "i"
          ).test(formatted);

        const exactNumberMatch =
          numberMatches ||
          formattedContainsTypedNumber;

        /*
         * Type de résultat Geoapify.
         */
        const resultType = String(
          properties.result_type || ""
        ).toLowerCase();

        /*
         * Type de correspondance Geoapify.
         */
        const matchType = String(
          properties.rank?.match_type || ""
        ).toLowerCase();

        const confidence = Number(
          properties.rank?.confidence || 0
        );

        const buildingConfidence = Number(
          properties.rank
            ?.confidence_building_level || 0
        );

        return {
          formatted,

          addressLine1,

          addressLine2,

          postcode,

          city,

          housenumber: houseNumber,

          street,

          resultType,

          matchType,

          confidence,

          buildingConfidence,

          hasHouseNumber,

          exactNumberMatch,

          latitude:
            coordinates.length >= 2
              ? coordinates[1]
              : null,

          longitude:
            coordinates.length >= 2
              ? coordinates[0]
              : null,

          placeId:
            properties.place_id || null,
        };
      })
      .filter(
        (item) =>
          item.formatted &&
          item.addressLine1
      );

    /*
     * =====================================================
     * CLASSEMENT DES SUGGESTIONS
     * =====================================================
     */

    suggestions.sort((a, b) => {
      /*
       * 1. Si l'utilisateur a saisi un numéro,
       * priorité absolue au numéro correspondant.
       */
      if (userTypedNumber) {
        if (
          a.exactNumberMatch !==
          b.exactNumberMatch
        ) {
          return a.exactNumberMatch ? -1 : 1;
        }

        /*
         * 2. Ensuite toutes les adresses possédant
         * un numéro passent avant les rues seules.
         */
        if (
          a.hasHouseNumber !==
          b.hasHouseNumber
        ) {
          return a.hasHouseNumber ? -1 : 1;
        }
      } else {
        /*
         * Même sans numéro, privilégier les adresses
         * précises plutôt que les rues seules.
         */
        if (
          a.hasHouseNumber !==
          b.hasHouseNumber
        ) {
          return a.hasHouseNumber ? -1 : 1;
        }
      }

      /*
       * 3. Qualité de la correspondance.
       */
      const matchPriority = {
        full_match: 6,
        match_by_building: 5,
        inner_part: 4,
        match_by_street: 3,
        match_by_postcode: 2,
        match_by_city_or_district: 1,
        match_by_country_or_state: 0,
      };

      const aMatch =
        matchPriority[a.matchType] ?? 0;

      const bMatch =
        matchPriority[b.matchType] ?? 0;

      if (aMatch !== bMatch) {
        return bMatch - aMatch;
      }

      /*
       * 4. Priorité aux bâtiments / maisons.
       */
      const typePriority = {
        building: 5,
        house: 5,
        amenity: 4,
        street: 1,
      };

      const aType =
        typePriority[a.resultType] ?? 0;

      const bType =
        typePriority[b.resultType] ?? 0;

      if (aType !== bType) {
        return bType - aType;
      }

      /*
       * 5. Confiance bâtiment.
       */
      if (
        a.buildingConfidence !==
        b.buildingConfidence
      ) {
        return (
          b.buildingConfidence -
          a.buildingConfidence
        );
      }

      /*
       * 6. Confiance générale.
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
     * FILTRE FINAL SI UN NUMÉRO A ÉTÉ SAISI
     * =====================================================
     *
     * Si Geoapify nous donne une vraie correspondance
     * avec le numéro demandé, on retire les rues seules.
     */
    let finalSuggestions = suggestions;

    if (userTypedNumber) {
      const exactMatches =
        suggestions.filter(
          (item) =>
            item.exactNumberMatch
        );

      const numberedResults =
        suggestions.filter(
          (item) =>
            item.hasHouseNumber
        );

      if (exactMatches.length > 0) {
        finalSuggestions =
          exactMatches;
      } else if (
        numberedResults.length > 0
      ) {
        finalSuggestions =
          numberedResults;
      }
    }

    /*
     * Maximum 6 suggestions.
     */
    finalSuggestions =
      finalSuggestions.slice(0, 6);

    return NextResponse.json({
      success: true,
      suggestions: finalSuggestions,
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