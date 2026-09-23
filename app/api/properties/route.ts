import { NextRequest, NextResponse } from "next/server";

export type RentCastListing = {
  id: string;
  formattedAddress: string;
  price: number;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
};

export type RentCastResponse = RentCastListing[];

async function fetchProperties(url: string, apiKey: string) {
  const requestOptions: RequestInit = {
    headers: {
      "X-Api-Key": apiKey,
      Accept: "application/json",
    },
    cache: "no-store",
  };

  try {
    return await fetch(url, requestOptions);
  } catch (error) {
    console.warn("RentCast request failed, retrying once:", error);
    return fetch(url, requestOptions);
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get("city");
    const state = searchParams.get("state");
    const apiKey = process.env.RENTCAST_API_KEY;
    const url = process.env.RENTCAST_API_URL;

    if (!apiKey || !url) {
      return NextResponse.json(
        { message: "Rent cast configuration missing" },
        { status: 500 },
      );
    }

    if (!city || !state) {
      return NextResponse.json([]);
    }

    const rentCastParams = new URLSearchParams({
      city,
      state,
    });

    const response = await fetchProperties(`${url}?${rentCastParams}`, apiKey);

    if (!response.ok) {
      console.error("Rent Cast Error :", await response.text());
      return NextResponse.json(
        { message: "Unable to fetch Property Listing" },
        { status: response.status },
      );
    }

    const data: RentCastResponse = await response.json();
    if (!Array.isArray(data)) {
      console.error("Unexpected RentCast response shape");
      return NextResponse.json(
        { message: "Unable to parse property listings" },
        { status: 502 },
      );
    }

    const properties = data.map((property) => ({
      id: property.id,
      formattedAddress: property.formattedAddress,
      price: property.price,
      propertyType: property.propertyType,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      squareFootage: property.squareFootage,
    }));
    return NextResponse.json(properties);
  } catch (error) {
    console.error("Properties Route Error :", error);
    return NextResponse.json(
      { message: "Unable to connect to RentCast" },
      { status: 502 },
    );
  }
}
