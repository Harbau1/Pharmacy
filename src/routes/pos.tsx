import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Minus, PauseCircle, Plus, Printer, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import {
  completeSale,
  db,
  naira,
  nextInvoiceNumber,
  useHeldSales,
  useProducts,
} from "@/lib/store";
import type { PriceType, Sale, SaleItem } from "@/lib/types";

export const Route = createFileRoute("/pos")({
  head: () => ({
    meta: [
      { title: "Sell (POS) — Premier Plus Pharmacy & Opticals Ltd" },
      {
        name: "description",
        content: "Fast counter selling with retail or wholesale pricing and automatic stock deduction.",
      },
      { property: "og:title", content: "Point of Sale — Premier Plus Pharmacy" },
      { property: "og:description", content: "Search, sell and print invoices in seconds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: POS,
});

function POS() {
  const products = useProducts();
  const held = useHeldSales();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [payment, setPayment] = useState("Cash");
  const [soldBy, setSoldBy] = useState("Counter Staff");

  const matches = useMemo(() => {
    if (!products || !q.trim()) return [];
    const t = q.toLowerCase();
    return products
      .filter((p) => p.name.toLowerCase().includes(t) || p.generic_name.toLowerCase().includes(t))
      .slice(0, 8);
  }, [products, q]);

  const subtotal = cart.reduce((s, i) => s + i.amount, 0);
  const grandTotal = Math.max(0, subtotal - discount);

  function addToCart(id: string) {
    const p = products?.find((x) => x.id === id);
    if (!p) return;
    if (p.quantity_in_stock <= 0) {
      toast.error(`${p.name} is out of stock`);
      return;
    }
    setCart((c) => {
      const idx = c.findIndex((i) => i.product_id === p.id);
      if (idx >= 0) {
        const copy = [...c];
        const line = copy[idx]!;
        const qty = Math.min(line.qty + 1, p.quantity_in_stock);
        copy[idx] = { ...line, qty, amount: qty * line.unit_price };
        return copy;
      }
      return [
        ...c,
        {
          product_id: p.id,
          name: p.name,
          qty: 1,
          price_type: "retail",
          unit_price: p.retail_price,
          cost_price: p.cost_price,
          amount: p.retail_price,
        },
      ];
    });
    setQ("");
  }

  function updateLine(id: string, patch: Partial<SaleItem>) {
    setCart((c) =>
      c.map((line) => {
        if (line.product_id !== id) return line;
        const p = products?.find((x) => x.id === id);
        const merged = { ...line, ...patch };
        if (patch.price_type && p) {
          merged.unit_price = patch.price_type === "retail" ? p.retail_price : p.wholesale_price;
        }
        merged.qty = Math.max(1, Math.min(merged.qty, p?.quantity_in_stock ?? merged.qty));
        merged.amount = merged.qty * merged.unit_price;
        return merged;
      }),
    );
  }

  function holdSale() {
    if (!cart.length) return;
    db.setHeld([
      { id: `H${Date.now()}`, date: new Date().toISOString(), items: cart, discount },
      ...db.held(),
    ]);
    setCart([]);
    setDiscount(0);
    toast.success("Sale held");
  }

  function finish(print: boolean) {
    if (!cart.length) {
      toast.error("Cart is empty");
      return;
    }
    const sale: Sale = {
      id: `S${Date.now()}`,
      invoice_number: nextInvoiceNumber(),
      date: new Date().toISOString(),
      items_sold: cart,
      discount,
      total_amount: grandTotal,
      payment_method: payment,
      price_type: cart[0]!.price_type,
      sold_by: soldBy,
    };
    completeSale(sale);
    setCart([]);
    setDiscount(0);
    toast.success(`Sale completed — ${sale.invoice_number}`);
    if (print) navigate({ to: "/invoice/$invoiceId", params: { invoiceId: sale.invoice_number } });
  }

  return (
    <AppShell>
      <h1 className="mb-4 text-2xl font-bold tracking-tight">Point of Sale</h1>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Type item name…"
              className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm outline-none focus:border-primary"
            />
            {matches.length > 0 && (
              <div className="absolute z-20 mt-2 max-h-96 w-full overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
                {matches.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p.id)}
                    className="flex w-full items-center justify-between gap-3 border-b border-border/60 px-3 py-2.5 text-left last:border-0 hover:bg-secondary"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Qty {p.quantity_in_stock} · Cost {naira(p.cost_price)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right text-xs">
                      <p className="font-semibold text-primary">R {naira(p.retail_price)}</p>
                      <p className="text-success">W {naira(p.wholesale_price)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 space-y-2">
            {cart.length === 0 && (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Cart is empty. Search an item above to begin.
              </p>
            )}
            {cart.map((line) => (
              <div key={line.product_id} className="rounded-xl border border-border p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{line.name}</p>
                  <button
                    onClick={() => setCart((c) => c.filter((i) => i.product_id !== line.product_id))}
                    className="text-destructive"
                    aria-label="Remove line"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <div className="flex items-center rounded-lg border border-border">
                    <button
                      className="px-2 py-1.5"
                      onClick={() => updateLine(line.product_id, { qty: line.qty - 1 })}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <input
                      value={line.qty}
                      onChange={(e) => updateLine(line.product_id, { qty: Number(e.target.value) || 1 })}
                      className="w-12 border-x border-border bg-transparent py-1.5 text-center text-sm"
                    />
                    <button
                      className="px-2 py-1.5"
                      onClick={() => updateLine(line.product_id, { qty: line.qty + 1 })}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <select
                    value={line.price_type}
                    onChange={(e) =>
                      updateLine(line.product_id, { price_type: e.target.value as PriceType })
                    }
                    className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
                  >
                    <option value="retail">Retail</option>
                    <option value="wholesale">Wholesale</option>
                  </select>
                  <span className="ml-auto text-sm font-semibold">{naira(line.amount)}</span>
                </div>
              </div>
            ))}
          </div>

          {held && held.length > 0 && (
            <div className="mt-5 border-t border-border pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Held sales
              </p>
              <div className="flex flex-wrap gap-2">
                {held.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => {
                      setCart(h.items);
                      setDiscount(h.discount);
                      db.setHeld(db.held().filter((x) => x.id !== h.id));
                    }}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs"
                  >
                    {h.items.length} items · {naira(h.items.reduce((s, i) => s + i.amount, 0))}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-fit rounded-2xl border border-border bg-card p-4 shadow-sm lg:sticky lg:top-24">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Cart Summary
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium">{naira(subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Discount</dt>
              <dd>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                  className="w-28 rounded-lg border border-border bg-background px-2 py-1.5 text-right text-sm"
                />
              </dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-lg">
              <dt className="font-semibold">Grand Total</dt>
              <dd className="font-bold text-primary">{naira(grandTotal)}</dd>
            </div>
          </dl>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <label className="block">
              <span className="mb-1 block text-xs text-muted-foreground">Payment</span>
              <select
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm"
              >
                <option>Cash</option>
                <option>POS</option>
                <option>Transfer</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-muted-foreground">Sold by</span>
              <input
                value={soldBy}
                onChange={(e) => setSoldBy(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm"
              />
            </label>
          </div>

          <div className="mt-4 space-y-2">
            <button
              onClick={() => finish(false)}
              className="w-full rounded-xl bg-success py-3 text-sm font-semibold text-success-foreground"
            >
              Complete Sale
            </button>
            <button
              onClick={() => finish(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
            >
              <Printer className="h-4 w-4" /> Complete &amp; Print Invoice
            </button>
            <button
              onClick={holdSale}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-semibold"
            >
              <PauseCircle className="h-4 w-4" /> Hold Sale
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
