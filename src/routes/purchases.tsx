import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { naira, saveProduct, useProducts } from "@/lib/store";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/purchases")({
  head: () => ({
    meta: [
      { title: "Stock In — Premier Plus Pharmacy & Opticals Ltd" },
      {
        name: "description",
        content: "Receive new stock, increase quantities and update cost, retail and wholesale prices.",
      },
      { property: "og:title", content: "Stock In — Premier Plus Pharmacy" },
      { property: "og:description", content: "Record purchases and update prices on arrival." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Purchases,
});

function Purchases() {
  const products = useProducts();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [addQty, setAddQty] = useState(0);
  const [form, setForm] = useState({ cost: 0, retail: 0, wholesale: 0, expiry: "", supplier: "" });

  const matches = useMemo(() => {
    if (!products || !q.trim()) return [];
    const t = q.toLowerCase();
    return products
      .filter((p) => p.name.toLowerCase().includes(t) || p.generic_name.toLowerCase().includes(t))
      .slice(0, 8);
  }, [products, q]);

  function pick(p: Product) {
    setSelected(p);
    setQ("");
    setAddQty(0);
    setForm({
      cost: p.cost_price,
      retail: p.retail_price,
      wholesale: p.wholesale_price,
      expiry: p.expiry_date,
      supplier: p.supplier,
    });
  }

  function receive() {
    if (!selected) return;
    saveProduct({
      ...selected,
      quantity_in_stock: selected.quantity_in_stock + Math.max(0, addQty),
      cost_price: form.cost,
      retail_price: form.retail,
      wholesale_price: form.wholesale,
      expiry_date: form.expiry,
      supplier: form.supplier,
    });
    toast.success(`${addQty} units added to ${selected.name}`);
    setSelected(null);
  }

  return (
    <AppShell>
      <h1 className="mb-1 text-2xl font-bold tracking-tight">Purchase / Stock In</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Search an existing item, add the quantity received and update prices if they changed.
      </p>

      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search item to restock…"
          className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm outline-none focus:border-primary"
        />
        {matches.length > 0 && (
          <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-border bg-card shadow-lg">
            {matches.map((p) => (
              <button
                key={p.id}
                onClick={() => pick(p)}
                className="flex w-full items-center justify-between border-b border-border/60 px-4 py-2.5 text-left text-sm last:border-0 hover:bg-secondary"
              >
                <span>{p.name}</span>
                <span className="text-xs text-muted-foreground">Qty {p.quantity_in_stock}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="mt-5 max-w-xl rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold">{selected.name}</h2>
          <p className="text-sm text-muted-foreground">
            Current balance {selected.quantity_in_stock} · Value {naira(selected.quantity_in_stock * selected.cost_price)}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Num label="Quantity received" value={addQty} onChange={(v) => setAddQty(v)} />
            <Num label="Cost price (₦)" value={form.cost} onChange={(v) => setForm({ ...form, cost: v })} />
            <Num label="Retail price (₦)" value={form.retail} onChange={(v) => setForm({ ...form, retail: v })} />
            <Num label="Wholesale price (₦)" value={form.wholesale} onChange={(v) => setForm({ ...form, wholesale: v })} />
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted-foreground">Expiry date</span>
              <input
                type="date"
                value={form.expiry}
                onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted-foreground">Supplier</span>
              <input
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={receive}
              className="flex-1 rounded-xl bg-success py-3 text-sm font-semibold text-success-foreground"
            >
              Receive Stock
            </button>
            <button
              onClick={() => setSelected(null)}
              className="rounded-xl border border-border px-4 py-3 text-sm font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Num({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}
