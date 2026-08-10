import { NextResponse } from "next/server";

const GEOAPIFY_API_KEY =
  process.env.GEOAPIFY_API_KEY;

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

    const text =
      searchParams.get("text");

    if (!text || text.trim().length < 3) {
      return NextResponse.json({
        success: true,
        suggestions: [],
      });
    }

    const url =
      `https://api.geoapify.com/v1/geocode/autocomplete` +
      `?text=${encodeURIComponent(
        text.trim()
      )}` +
      `&limit=5` +
      `&filter=countrycode:fr` +
      `&lang=fr` +
      `&apiKey=${GEOAPIFY_API_KEY}`;

    const response =
      await fetch(url, {
        method: "GET",
        cache: "no-store",
      });

    if (!response.ok) {
      const errorText =
        await response.text();

      return NextResponse.json(
        {
          success: false,
          error:
            `Geoapify ${response.status}: ${errorText}`,
        },
        {
          status: response.status,
        }
      );
    }

    const data =
      await response.json();

    const suggestions =
      (data.features || [])
        .map((feature) => {
          const properties =
            feature.properties || {};

          const coordinates =
            feature.geometry?.coordinates;

          return {
            formatted:
              properties.formatted || "",

            addressLine1:
              properties.address_line1 || "",

            addressLine2:
              properties.address_line2 || "",

            postcode:
              properties.postcode || "",

            city:
              properties.city ||
              properties.town ||
              properties.village ||
              properties.municipality ||
              "",

            latitude:
              coordinates?.[1] ?? null,

            longitude:
              coordinates?.[0] ?? null,
          };
        })
        .filter(
          (item) =>
            item.formatted
        );

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
          "Erreur autocomplete.",
      },
      {
        status: 500,
      }
    );
  }
}
