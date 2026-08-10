import { NextResponse } from “next/server”;

const GEOAPIFY_API_KEY =
process.env.GEOAPIFY_API_KEY;

const SERVER_CACHE = new Map();

const CACHE_DURATION =
60 * 1000;

const MAX_CACHE_SIZE = 100;

function cleanText(text) {
return String(text || “”)
.trim()
.replace(/\s+/g, “ “);
}

function normalizeAddressQuery(text) {
let value = cleanText(text);

value = value.replace(
/^(\d+[A-Za-z]?)\s*(rue|avenue|av|boulevard|bd|chemin|route|place|impasse|allee|allée|cours|quai|square|passage)\b/i,
“$1 $2”
);

return value;
}

function getCachedResult(key) {
const cached =
SERVER_CACHE.get(key);

if (!cached) {
return null;
}

if (
Date.now() -
cached.timestamp >
CACHE_DURATION
) {
SERVER_CACHE.delete(key);
return null;
}

return cached.data;
}

function setCachedResult(
key,
data
) {
SERVER_CACHE.set(key, {
data,
timestamp: Date.now(),
});

if (
SERVER_CACHE.size >
MAX_CACHE_SIZE
) {
const oldestKey =
SERVER_CACHE.keys().next()
.value;

if (oldestKey) {
  SERVER_CACHE.delete(
    oldestKey
  );
}

}
}

function extractHouseNumber(
text
) {
const match =
text.match(
/^\s*(\d+(?:[A-Za-z])?(?:\s*(?:bis|ter|quater))?(?:\s*[-/]\s*\d+(?:[A-Za-z])?)?)/i
);

return match
? match[1].trim()
: null;
}

function getCity(properties) {
return (
properties.city ||
properties.town ||
properties.village ||
properties.municipality ||
“”
);
}

function buildFormattedAddress(
properties
) {
const houseNumber =
properties.housenumber ||
properties.house_number ||
“”;

const street =
properties.street ||
properties.address_line1 ||
“”;

const postcode =
properties.postcode ||
“”;

const city =
getCity(properties);

if (
houseNumber &&
street
) {
return [
${houseNumber} ${street},
[postcode, city]
.filter(Boolean)
.join(” “),
]
.filter(Boolean)
.join(”, “);
}

return (
properties.formatted ||
[
street,
[postcode, city]
.filter(Boolean)
.join(” “),
]
.filter(Boolean)
.join(”, “)
);
}

function hasHouseNumber(
properties,
formatted
) {
const houseNumber =
cleanText(
properties.housenumber ||
properties.house_number ||
“”
);

if (houseNumber) {
return true;
}

return /^\s*\d+(?:[A-Za-z])?\b/.test(
formatted
);
}

function scoreSuggestion(
feature,
originalText
) {
const properties =
feature.properties || {};

const formatted =
cleanText(
properties.formatted ||
properties.address_line1 ||
“”
);

const normalizedOriginal =
cleanText(
originalText
).toLowerCase();

const normalizedFormatted =
formatted.toLowerCase();

const requestedNumber =
extractHouseNumber(
originalText
);

const returnedNumber =
cleanText(
properties.housenumber ||
properties.house_number ||
“”
);

const resultType =
String(
properties.result_type ||
“”
).toLowerCase();

const category =
String(
properties.category ||
“”
).toLowerCase();

let score = 0;

// —————————————————––
// NUMÉRO
// —————————————————––

if (requestedNumber) {
if (returnedNumber) {
score += 100;
}

if (
  returnedNumber.toLowerCase() ===
  requestedNumber.toLowerCase()
) {
  score += 500;
}
const escapedNumber =
  requestedNumber.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
if (
  new RegExp(
    `^\\s*${escapedNumber}\\b`,
    "i"
  ).test(formatted)
) {
  score += 500;
}

} else if (
returnedNumber
) {
score += 50;
}

// —————————————————––
// TYPE DE RÉSULTAT
// —————————————————––

if (
resultType === “building” ||
resultType === “house”
) {
score += 150;
}

if (
category.includes(
“building”
) ||
category.includes(
“residential”
)
) {
score += 40;
}

if (
resultType === “street”
) {
score -= 100;
}

if (
resultType === “city”
) {
score -= 150;
}

// —————————————————––
// ADRESSE COMPLÈTE
// —————————————————––

if (
properties.postcode &&
getCity(properties)
) {
score += 40;
}

if (
properties.address_line1 &&
properties.address_line2
) {
score += 20;
}

// —————————————————––
// CORRESPONDANCE EXACTE
// —————————————————––

if (
normalizedFormatted.includes(
normalizedOriginal
)
) {
score += 200;
}

// —————————————————––
// CORRESPONDANCE DES MOTS
// —————————————————––

const words =
normalizedOriginal
.split(/[\s,]+/)
.filter(
(word) =>
word.length >= 2
);

for (
const word of words
) {
if (
normalizedFormatted.includes(
word
)
) {
score += 10;
}
}

return score;
}

async function fetchGeoapify(
url
) {
const response =
await fetch(url, {
method: “GET”,
cache: “no-store”,
});

if (!response.ok) {
const errorText =
await response.text();

throw new Error(
  `Geoapify ${response.status}: ${errorText}`
);

}

return response.json();
}

export async function GET(
request
) {
try {
if (!GEOAPIFY_API_KEY) {
return NextResponse.json(
{
success: false,
error:
“GEOAPIFY_API_KEY non configurée.”,
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
  cleanText(
    rawText
  ).length < 3
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
const cacheKey =
  text.toLowerCase();
const cached =
  getCachedResult(
    cacheKey
  );
if (cached) {
  return NextResponse.json(
    cached,
    {
      headers: {
        "Cache-Control":
          "public, s-maxage=60, stale-while-revalidate=120",
      },
    }
  );
}
const requestedNumber =
  extractHouseNumber(
    text
  );
let features = [];
// -----------------------------------------------------
// RECHERCHE AUTOCOMPLETE
// -----------------------------------------------------
const autocompleteUrl =
  `https://api.geoapify.com/v1/geocode/autocomplete` +
  `?text=${encodeURIComponent(
    text
  )}` +
  `&limit=8` +
  `&filter=countrycode:fr` +
  `&lang=fr` +
  `&apiKey=${GEOAPIFY_API_KEY}`;
try {
  const data =
    await fetchGeoapify(
      autocompleteUrl
    );
  features.push(
    ...(data.features || [])
  );
} catch (error) {
  console.warn(
    "Geoapify autocomplete:",
    error.message
  );
}
// -----------------------------------------------------
// RECHERCHE PRÉCISE UNIQUEMENT SI NUMÉRO
// -----------------------------------------------------
if (
  requestedNumber
) {
  const searchUrl =
    `https://api.geoapify.com/v1/geocode/search` +
    `?text=${encodeURIComponent(
      text
    )}` +
    `&housenumber=${encodeURIComponent(
      requestedNumber
    )}` +
    `&limit=8` +
    `&filter=countrycode:fr` +
    `&lang=fr` +
    `&apiKey=${GEOAPIFY_API_KEY}`;
  try {
    const data =
      await fetchGeoapify(
        searchUrl
      );
    features.push(
      ...(data.features || [])
    );
  } catch (error) {
    console.warn(
      "Geoapify recherche précise:",
      error.message
    );
  }
}
// -----------------------------------------------------
// DÉDOUBLONNAGE
// -----------------------------------------------------
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
      properties.formatted,
      coordinates[0],
      coordinates[1],
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
// -----------------------------------------------------
// TRI
// -----------------------------------------------------
const sorted =
  Array.from(
    unique.values()
  )
    .map(
      (feature) => ({
        feature,
        score:
          scoreSuggestion(
            feature,
            text
          ),
      })
    )
    .sort(
      (a, b) =>
        b.score -
        a.score
    );
// -----------------------------------------------------
// FORMAT FINAL
// -----------------------------------------------------
const suggestions =
  sorted
    .slice(0, 6)
    .map(
      ({
        feature,
      }) => {
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
            : properties.address_line1 ||
              street ||
              formatted;
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
          hasHouseNumber:
            hasHouseNumber(
              properties,
              formatted
            ),
          latitude:
            coordinates.length >=
            2
              ? coordinates[1]
              : null,
          longitude:
            coordinates.length >=
            2
              ? coordinates[0]
              : null,
          placeId:
            properties.place_id ||
            null,
          confidence:
            properties.rank
              ?.confidence ??
            null,
        };
      }
    )
    .filter(
      (item) =>
        item.formatted
    );
const responseData = {
  success: true,
  suggestions,
};
setCachedResult(
  cacheKey,
  responseData
);
return NextResponse.json(
  responseData,
  {
    headers: {
      "Cache-Control":
        "public, s-maxage=60, stale-while-revalidate=120",
    },
  }
);

} catch (error) {
console.error(
“Autocomplete Geoapify:”,
error
);

return NextResponse.json(
  {
    success: false,
    error:
      error?.message ||
      "Erreur pendant l'autocomplétion.",
    suggestions: [],
  },
  {
    status: 500,
  }
);

}
}