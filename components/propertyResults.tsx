import PropertyCard from "./propertyCard";
import type { RentCastListing } from "@/app/api/properties/route";

type PropertyResultsProps = {
  properties: RentCastListing[];
};

export default function PropertyResults({ properties }: PropertyResultsProps) {
  if (properties.length === 0) {
    return <div>No Listing Found</div>;
  }

  return (
    <section className="bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
            Search results
          </p>

          <div className="mt-2 flex items-end justify-between gap-4">
            <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">
              Available properties
            </h1>

            <p className="text-sm text-slate-500">
              {properties.length}{" "}
              {properties.length === 1 ? "property" : "properties"}
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
}
