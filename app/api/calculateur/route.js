import { NextResponse } from "next/server";

const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;

export async function GET() {
  try {
    if (!GEOAPIFY_API_KEY) {
      return NextResponse.json(
        { error: "GEOAPIFY_API_KEY absente de Vercel" },
        { status: 500 }
      );
    }

    const url =
      `https://api.geoapify.com/v1/geocode/search` +
      `?text=${encodeURIComponent("Paris")}` +
      `&apiKey=${encodeURIComponent(GEOAPIFY_API_KEY)}`;

    const response = await fetch(url);

    const data = await response.json();

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      geoapify: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json({
    message: "Test en cours",
  });
}