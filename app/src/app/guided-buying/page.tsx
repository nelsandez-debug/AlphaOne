import { redirect } from "next/navigation";
import { Package, Search } from "lucide-react";
import { requireUser, UnauthenticatedError } from "@/lib/current-user";

// No schema/permission module yet — this is a styling-only placeholder per
// the P2P V2 design handoff (Guided Buying.dc.html); real catalog data,
// categories, and a permission module are follow-up work. Only gated on
// being signed in, matching the nav item having no moduleKey.
const CATEGORIES = ["All", "IT & Software", "Office Supplies", "Facilities", "Professional Services", "Travel"];

const PRODUCTS = [
  { name: "Laptop — 14\" Business", supplier: "Meridian Logistics", price: "$1,240" },
  { name: "Standing Desk", supplier: "Northwind Supply Co.", price: "$480" },
  { name: "Cloud Storage — 1TB/mo", supplier: "Aster Consulting", price: "$65/mo" },
  { name: "Ergonomic Chair", supplier: "Northwind Supply Co.", price: "$320" },
  { name: "Conference Room Display", supplier: "Meridian Logistics", price: "$890" },
  { name: "Security Audit — Standard", supplier: "Aster Consulting", price: "$4,500" },
  { name: "Wireless Headset", supplier: "Northwind Supply Co.", price: "$140" },
  { name: "Site License — Design Suite", supplier: "Meridian Logistics", price: "$2,100/yr" },
];

export default async function GuidedBuyingPage() {
  try {
    await requireUser();
  } catch (err) {
    if (err instanceof UnauthenticatedError) redirect("/sign-in");
    throw err;
  }

  return (
    <div className="mx-auto w-full max-w-6xl p-4">
      <div className="mb-6">
        <h1 className="text-2xl">Guided Buying</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Preferred-supplier catalog for common purchases — placeholder content pending a real catalog integration.
        </p>
      </div>

      <div className="glass mb-4 flex items-center gap-3 p-4">
        <Search size={16} className="text-neutral-500" />
        <input
          type="text"
          placeholder="Search catalog items, suppliers, or SKUs…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-500"
        />
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="glass p-5">
          <div className="text-[10px] tracking-[0.1em] text-accent-700 uppercase">Catalog items</div>
          <div className="font-heading text-3xl">12,400</div>
        </div>
        <div className="glass p-5">
          <div className="text-[10px] tracking-[0.1em] text-accent-700 uppercase">Preferred suppliers</div>
          <div className="font-heading text-3xl">86</div>
        </div>
        <div className="glass p-5">
          <div className="text-[10px] tracking-[0.1em] text-accent-700 uppercase">Avg. order-to-cart time</div>
          <div className="font-heading text-3xl">2.1 min</div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {CATEGORIES.map((c, i) => (
          <button
            key={c}
            type="button"
            className={`rounded-full border px-3.5 py-1.5 text-xs ${
              i === 0
                ? "border-accent-600 bg-accent-600 text-white"
                : "border-black/[0.06] bg-white/50 text-neutral-800 hover:bg-white/80"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="glass p-5">
        <div className="mb-3 font-heading text-lg">Preferred supplier catalog · All</div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {PRODUCTS.map((p) => (
            <div key={p.name} className="rounded-2xl border border-black/[0.06] bg-white/60 p-4">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-100 text-accent-700">
                <Package size={18} strokeWidth={1.5} />
              </div>
              <div className="text-sm font-medium">{p.name}</div>
              <div className="text-xs text-neutral-600">{p.supplier}</div>
              <div className="mt-1.5 text-sm font-semibold text-accent-800">{p.price}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
