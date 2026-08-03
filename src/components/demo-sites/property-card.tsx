import { Bath, BedDouble, Maximize } from "lucide-react";
import { DemoImage } from "./demo-image";
import type { DemoProperty } from "@/lib/demo-sites";

/**
 * A listing card for the estate-agency demo.
 *
 * The prices and addresses are invented. This is the section that makes the site
 * read as a brokerage rather than the clinic template recoloured, so it carries
 * the details a real listing would: status, price, area, and the bed/bath/size
 * triplet buyers actually scan for.
 */
export function PropertyCard({ property }: { property: DemoProperty }) {
  return (
    <article className="group overflow-hidden rounded-[1.5rem] border border-border-subtle bg-surface shadow-[0_10px_30px_rgba(27,34,48,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(27,34,48,0.12)]">
      <div className="relative">
        <DemoImage
          src={property.image.src}
          alt={property.image.alt}
          aspect="aspect-[4/3]"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
        <span className="absolute left-4 top-4 rounded-full bg-bg-elevated/95 px-3 py-1 text-xs font-bold text-brand-glow-text backdrop-blur">
          {property.status}
        </span>
      </div>

      <div className="p-6">
        <p className="font-serif text-2xl">{property.price}</p>
        <p className="mt-2 font-bold">{property.address}</p>
        <p className="mt-1 text-sm text-muted">{property.area}</p>

        <dl className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border-subtle pt-4 text-sm text-muted">
          <div className="flex items-center gap-2">
            <BedDouble aria-hidden className="size-4 text-brand" />
            <dt className="sr-only">Bedrooms</dt>
            <dd>{property.beds}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Bath aria-hidden className="size-4 text-brand" />
            <dt className="sr-only">Bathrooms</dt>
            <dd>{property.baths}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Maximize aria-hidden className="size-4 text-brand" />
            <dt className="sr-only">Size</dt>
            <dd>{property.size}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
