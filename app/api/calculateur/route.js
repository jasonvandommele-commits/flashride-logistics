import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.GEOAPIFY_API_KEY;

  return NextResponse.json({
    configured: !!key,
    length: key ? key.length : 0,
    startsWith: key ? key.substring(0, 4) : null,
    endsWith: key ? key.substring(key.length - 4) : null,
  });
}