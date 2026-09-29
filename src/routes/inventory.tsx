import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import {
  adjustStock,
  db,
  deleteProduct,
  naira,
  newProductId,
  saveProduct,
  stockStatus,
  useProducts,
} from "@/lib/store";
import type { Category, Product } from "@/lib/types";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — Premier Plus Pharmacy & Opticals Ltd" },
      {
        name: "description",
        content: "Manage drugs, opticals and consumables stock levels, prices and expiry dates.",
      },
      { property: "og:title", content: "Inventory — Premier Plus Pharmacy" },
      { property: "og:description", content: "Stock levels, prices and expiry control." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Inventory,
});

const empty: Product = {
  id: "",
  name: "",
  generic_name: "",
  category: "Drug",
  barcode: "",
  quantity_in_stock: 0,
  cost_price: 0,
  retail_price: 0,
  wholesale_price: 0,
  expiry_date: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
  supplier: "",
  shelf_location: "",
  min_stock_level: 10,
};

const statusStyles = {
  in: "bg-success/15 text-success",
  low: "bg-warning/25 text-warning-foreground",
  out: "bg-destructive/10 text-destructive",
  expired: "bg-destructive text-destructive-foreground",
} as const;

const statusLabel = { in: "In Stock", low: "Low Stock", out: "Out of Stock", expired: "Expired" };

function Inventory() {
  const products = useProducts();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"All" | Category>("All");
  const [editing, setEditing] = useState<Product | null>(null);
  const [stockFor, setStockFor] = useState<Product | null>(null);

  const rows = useMemo(() => {
    if (!products) return [];
    const t = q.toLowerCase();
    return products.filter(
      (p) =>
        (cat === "All" || p.category === cat) &&
        (p.name.toLowerCase().includes(t) || p.generic_name.toLowerCase().includes(t)),
    );
  }, [products, q, cat]);

  return (
    <AppShell>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory / Stock</h1>
          <p className="text-sm text-muted-foreground">{rows.length} items listed</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (confirm("Reset all data back to the sample inventory and sales?")) {
                db.reset();
                toast.success("Sample data restored");
              }
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
          <button
            onClick={() => setEditing({ ...empty, id: newProductId() })}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" /> Add New Item
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search item…"
          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value as Category | "All")}
          className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary"
        >
          {["All", "Drug", "Opticals", "Consumables"].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-secondary/70 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Qty Bal.</th>
              <th className="px-4 py-3">Cost</th>
              <th className="px-4 py-3">Retail</th>
              <th className="px-4 py-3">Wholesale</th>
              <th className="px-4 py-3">Expiry</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const st = stockStatus(p);
              return (
                <tr key={p.id} className="border-t border-border/70">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.generic_name} · {p.category}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-semibold">{p.quantity_in_stock}</td>
                  <td className="px-4 py-3">{naira(p.cost_price)}</td>
                  <td className="px-4 py-3">{naira(p.retail_price)}</td>
                  <td className="px-4 py-3">{naira(p.wholesale_price)}</td>
                  <td className="px-4 py-3 text-xs">{p.expiry_date}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[st]}`}>
                      {statusLabel[st]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setStockFor(p)}
                        className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium"
                      >
                        Update Stock
                      </button>
                      <button
                        onClick={() => setEditing(p)}
                        className="rounded-lg bg-primary/10 p-2 text-primary"
                        aria-label="Edit item"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete ${p.name}?`)) {
                            deleteProduct(p.id);
                            toast.success("Item deleted");
                          }
                        }}
                        className="rounded-lg bg-destructive/10 p-2 text-destructive"
                        aria-label="Delete item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editing && (
        <EditDialog
          product={editing}
          onClose={() => setEditing(null)}
          onSave={(p) => {
            saveProduct(p);
            setEditing(null);
            toast.success("Item saved");
          }}
        />
      )}

      {stockFor && (
        <StockDialog
          product={stockFor}
          onClose={() => setStockFor(null)}
          onApply={(delta) => {
            adjustStock(stockFor.id, delta);
            setStockFor(null);
            toast.success("Stock updated");
          }}
        />
      )}
    </AppShell>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 sm:items-center sm:p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-card p-5 shadow-xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-sm text-muted-foreground">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      <input
        {...props}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

function EditDialog({
  product,
  onClose,
  onSave,
}: {
  product: Product;
  onClose: () => void;
  onSave: (p: Product) => void;
}) {
  const [form, setForm] = useState<Product>(product);
  const set = (k: keyof Product, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Modal title={product.name ? "Edit Item" : "Add New Item"} onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Field label="Item name" value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <Field label="Generic name" value={form.generic_name} onChange={(e) => set("generic_name", e.target.value)} />
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Category</span>
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option>Drug</option>
            <option>Opticals</option>
            <option>Consumables</option>
          </select>
        </label>
        <Field
          label="Quantity in stock"
          type="number"
          value={form.quantity_in_stock}
          onChange={(e) => set("quantity_in_stock", Number(e.target.value))}
        />
        <Field
          label="Min stock level"
          type="number"
          value={form.min_stock_level}
          onChange={(e) => set("min_stock_level", Number(e.target.value))}
        />
        <Field label="Cost price (₦)" type="number" value={form.cost_price} onChange={(e) => set("cost_price", Number(e.target.value))} />
        <Field label="Retail price (₦)" type="number" value={form.retail_price} onChange={(e) => set("retail_price", Number(e.target.value))} />
        <Field label="Wholesale price (₦)" type="number" value={form.wholesale_price} onChange={(e) => set("wholesale_price", Number(e.target.value))} />
        <Field label="Expiry date" type="date" value={form.expiry_date} onChange={(e) => set("expiry_date", e.target.value)} />
        <Field label="Supplier" value={form.supplier} onChange={(e) => set("supplier", e.target.value)} />
        <Field label="Shelf location" value={form.shelf_location} onChange={(e) => set("shelf_location", e.target.value)} />
        <div className="col-span-2">
          <Field label="Barcode" value={form.barcode} onChange={(e) => set("barcode", e.target.value)} />
        </div>
      </div>
      <button
        onClick={() => form.name.trim() && onSave(form)}
        className="mt-5 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
      >
        Save Item
      </button>
    </Modal>
  );
}

function StockDialog({
  product,
  onClose,
  onApply,
}: {
  product: Product;
  onClose: () => void;
  onApply: (delta: number) => void;
}) {
  const [qty, setQty] = useState(1);
  return (
    <Modal title={`Update Stock — ${product.name}`} onClose={onClose}>
      <p className="mb-3 text-sm text-muted-foreground">
        Current balance: <span className="font-semibold text-foreground">{product.quantity_in_stock}</span>
      </p>
      <Field label="Quantity" type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} />
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => onApply(Math.abs(qty))}
          className="rounded-xl bg-success py-3 text-sm font-semibold text-success-foreground"
        >
          Add Stock
        </button>
        <button
          onClick={() => onApply(-Math.abs(qty))}
          className="rounded-xl bg-destructive py-3 text-sm font-semibold text-destructive-foreground"
        >
          Remove Stock
        </button>
      </div>
    </Modal>
  );
}
