import { NextRequest, NextResponse } from "next/server";

export type GeoapifyLocation = {
  place_id: string;
  name: string;
  city: string;
  state: string;
  state_code: string;
};

type GeoapifyResponse = {
  results: GeoapifyLocation[];
};

async function fetchLocations(url: string) {
  try {
    return await fetch(url, { cache: "no-store" });
  } catch (error) {
    console.warn("Geoapify request failed, retrying once:", error);
    return fetch(url, { cache: "no-store" });
  }
}

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q")?.trim();
    const apiKey = process.env.GEOAPIFY_API_KEY;
    const url = process.env.NEXT_PUBLIC_GEOAPIFY_BASE_URL;

    if (!apiKey || !url) {
      return NextResponse.json(
        { message: "Geoapify configuration missing" },
        { status: 500 },
      );
    }

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const geoapifyParams = new URLSearchParams({
      text: query,
      type: "city",
      filter: "countrycode:us",
      format: "json",
      lang: "en",
      limit: "6",
      apiKey,
    });

    const response = await fetchLocations(`${url}?${geoapifyParams}`);

    if (!response.ok) {
      console.error("Geoapify error :", await response.text());
      return NextResponse.json(
        {
          message: "Unable to retrieve locations",
        },
        { status: response.status },
      );
    }

    const data: GeoapifyResponse = await response.json();
    const locations = (data.results ?? [])
      .map((location) => {
        const city = location.city ?? location.name;
        const stateCode = location.state_code?.split("-").at(-1)?.toUpperCase();

        return {
          id: location.place_id ?? `${city}-${stateCode}`,
          label: `${city}, ${stateCode}`,
          city,
          state: location.state,
          stateCode,
        };
      })
      .filter(
        (location) => Boolean(location.city) && Boolean(location.stateCode),
      );
    return NextResponse.json(locations);
  } catch (error) {
    console.error("Location route error:", error);

    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
