"use client";
import { LocationSuggestion } from "@/types/location";
import type { RentCastListing } from "@/app/api/properties/route";
import {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
} from "react";
import PropertyResults from "./propertyResults";

export default function PropertySearch() {
  const [query, setQuery] = useState<string>("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [properties, setProperties] = useState<RentCastListing[]>([]);
  const [locations, setLocations] = useState<LocationSuggestion[]>([]);
  const [activeLocationIndex, setActiveLocationIndex] = useState(-1);

  const [selectedLocation, setSelectedLocation] =
    useState<LocationSuggestion | null>(null);

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      return;
    }
    if (selectedLocation?.city === trimmedQuery) {
      return;
    }

    const controller = new AbortController();

    const timeOut = setTimeout(async () => {
      try {
        setLocationLoading(true);
        const params = new URLSearchParams({
          q: trimmedQuery,
        });
        const response = await fetch(`/api/locations?${params}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Unable to retrieve locations");
        }
        const data: LocationSuggestion[] = await response.json();
        setLocations(data);
        setActiveLocationIndex(-1);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error(error.message);
        }
      } finally {
        setLocationLoading(false);
      }
    }, 400);
    return () => {
      clearTimeout(timeOut);
      controller.abort();
    };
  }, [query, selectedLocation]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const nextQuery = e.target.value;
    setQuery(nextQuery);
    setSelectedLocation(null);
    setActiveLocationIndex(-1);
    if (nextQuery.trim().length < 2) {
      setLocations([]);
    }
    setError("");
  };

  const handleLocationSelect = (location: LocationSuggestion) => {
    setQuery(location.city);
    setSelectedLocation(location);
    setLocations([]);
    setActiveLocationIndex(-1);
    setError("");
  };

  const handleLocationKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setLocations([]);
      setActiveLocationIndex(-1);
      return;
    }

    if (locations.length === 0) {
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveLocationIndex((currentIndex) =>
        currentIndex >= locations.length - 1 ? 0 : currentIndex + 1,
      );
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveLocationIndex((currentIndex) =>
        currentIndex <= 0 ? locations.length - 1 : currentIndex - 1,
      );
      return;
    }

    if (e.key === "Enter" && activeLocationIndex >= 0) {
      e.preventDefault();
      handleLocationSelect(locations[activeLocationIndex]);
    }
  };

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedLocation) {
      setError("Select a location from the suggestions");
      return;
    }
    try {
      setPropertiesLoading(true);
      setError("");
      const params = new URLSearchParams({
        city: selectedLocation.city,
        state: selectedLocation.stateCode,
      });
      const response = await fetch(`/api/properties?${params}`);
      if (!response.ok) {
        const data = await response.json();

        throw new Error(data.message || "Unable to retrieve properties");
      }

      const data: RentCastListing[] = await response.json();
      setProperties(data);
    } catch (error) {
      setProperties([]);

      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setPropertiesLoading(false);
    }
  };

  return (
    <section className="bg-[#f7f8f5] px-4 py-16 sm:px-6 lg:py-24">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Find your next home
        </p>

        <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
          Discover a place you’ll love to live
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
          Search through available homes and find a property that matches your
          lifestyle.
        </p>

        <form className="mx-auto mt-10 max-w-2xl" onSubmit={handleSearch}>
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg shadow-slate-200/60 sm:flex-row">
            <div className="relative flex-1">
              <label htmlFor="location" className="sr-only">
                Search location
              </label>

              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400">
                ⌖
              </span>

              <input
                id="location"
                name="location"
                type="text"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={locations.length > 0}
                aria-controls="location-suggestions"
                aria-activedescendant={
                  activeLocationIndex >= 0
                    ? `location-option-${activeLocationIndex}`
                    : undefined
                }
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleLocationKeyDown}
                placeholder="Enter a city, state or ZIP code"
                className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              />
              {locationLoading && <p>Finding locations...</p>}

              {locations.length > 0 && (
                <div
                  id="location-suggestions"
                  role="listbox"
                  aria-label="Location suggestions"
                  className="absolute w-full bg-white px-3 text-left text-black shadow-lg"
                >
                  {locations.map((location, index) => (
                    <button
                      id={`location-option-${index}`}
                      key={location.id}
                      type="button"
                      role="option"
                      aria-selected={activeLocationIndex === index}
                      tabIndex={-1}
                      onMouseEnter={() => setActiveLocationIndex(index)}
                      onClick={() => handleLocationSelect(location)}
                      className={`block w-full px-3 py-2 text-left ${
                        activeLocationIndex === index ? "bg-emerald-50" : ""
                      }`}
                    >
                      {location.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={propertiesLoading}
              className="h-14 rounded-xl bg-emerald-700 px-8 font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-200"
            >
              {propertiesLoading ? "Searching..." : "Search properties"}
            </button>
          </div>
        </form>
        {error && <p>{error}</p>}

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-slate-500">
          <span>Popular:</span>

          <button
            type="button"
            className="hover:text-emerald-700"
            onClick={() => setQuery("Austin")}
          >
            Austin
          </button>

          <button
            type="button"
            className="hover:text-emerald-700"
            onClick={() => setQuery("Miami")}
          >
            Miami
          </button>

          <button
            type="button"
            className="hover:text-emerald-700"
            onClick={() => setQuery("Dallas")}
          >
            Dallas
          </button>

          <button
            type="button"
            className="hover:text-emerald-700"
            onClick={() => setQuery("Atlanta")}
          >
            Atlanta
          </button>

          <PropertyResults properties={properties} />
        </div>
      </div>
    </section>
  );
}
