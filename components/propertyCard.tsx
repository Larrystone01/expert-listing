import type { RentCastListing } from "@/app/api/properties/route";

type PropertyCardProps = {
  property: RentCastListing;
};

export default function PropertyCard({ property }: PropertyCardProps) {
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(property.price);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative flex h-44 items-end bg-gradient-to-br from-emerald-950 via-emerald-800 to-emerald-600 p-5">
        {property.propertyType && (
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-900">
            {property.propertyType}
          </span>
        )}

        <div>
          <p className="text-sm text-emerald-100">Listed price</p>

          <p className="mt-1 text-3xl font-bold text-white">{formattedPrice}</p>
        </div>
      </div>

      <div className="p-5">
        <h2 className="min-h-14 text-lg font-semibold leading-7 text-slate-950">
          {property.formattedAddress}
        </h2>

        <div className="mt-5 grid grid-cols-3 divide-x divide-slate-200 rounded-xl border border-slate-200 bg-slate-50 py-4">
          <PropertyFeature value={property.bedrooms ?? "—"} label="Bedrooms" />

          <PropertyFeature
            value={property.bathrooms ?? "—"}
            label="Bathrooms"
          />

          <PropertyFeature
            value={
              property.squareFootage
                ? property.squareFootage.toLocaleString()
                : "—"
            }
            label="Sq ft"
          />
        </div>

        <button
          type="button"
          className="mt-5 w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          View property
        </button>
      </div>
    </article>
  );
}

type PropertyFeatureProps = {
  value: string | number;
  label: string;
};

function PropertyFeature({ value, label }: PropertyFeatureProps) {
  return (
    <div className="px-2 text-center">
      <p className="font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}
