import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { naira, useSales } from "@/lib/store";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Sales Reports — Premier Plus Pharmacy & Opticals Ltd" },
      {
        name: "description",
        content: "Filter sales by day, week, month or custom range and see gross profit per period.",
      },
      { property: "og:title", content: "Sales Reports — Premier Plus Pharmacy" },
      { property: "og:description", content: "Revenue, profit and invoice history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Reports,
});

type Preset = "today" | "week" | "month" | "custom";

function Reports() {
  const sales = useSales();
  const [preset, setPreset] = useState<Preset>("today");
  const [from, setFrom] = useState(new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));

  const filtered = useMemo(() => {
    if (!sales) return [];
    const now = new Date();
    let start: Date;
    let end = new Date(now);
    end.setHours(23, 59, 59, 999);
    if (preset === "today") {
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
    } else if (preset === "week") {
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
      start.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    } else if (preset === "month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      start = new Date(from + "T00:00:00");
      end = new Date(to + "T23:59:59");
    }
    return sales.filter((s) => {
      const d = new Date(s.date);
      return d >= start && d <= end;
    });
  }, [sales, preset, from, to]);

  const revenue = filtered.reduce((s, x) => s + x.total_amount, 0);
  const profit = filtered.reduce(
    (s, x) =>
      s + x.items_sold.reduce((a, i) => a + (i.unit_price - i.cost_price) * i.qty, 0) - x.discount,
    0,
  );
  const units = filtered.reduce((s, x) => s + x.items_sold.reduce((a, i) => a + i.qty, 0), 0);

  return (
    <AppShell>
      <h1 className="mb-4 text-2xl font-bold tracking-tight">Reports &amp; Invoices</h1>

      <div className="mb-4 flex flex-wrap items-end gap-2">
        {(["today", "week", "month", "custom"] as Preset[]).map((p) => (
          <button
            key={p}
            onClick={() => setPreset(p)}
            className={`rounded-xl px-4 py-2 text-sm font-medium capitalize ${
              preset === p
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted-foreground"
            }`}
          >
            {p === "week" ? "This Week" : p === "month" ? "This Month" : p === "today" ? "Today" : "Custom"}
          </button>
        ))}
        {preset === "custom" && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-xl border border-border bg-card px-3 py-2 text-sm"
            />
            <span className="text-muted-foreground">to</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-xl border border-border bg-card px-3 py-2 text-sm"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Invoices" value={String(filtered.length)} />
        <Stat label="Units Sold" value={String(units)} />
        <Stat label="Total Sales" value={naira(revenue)} />
        <Stat label="Gross Profit" value={naira(profit)} accent />
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-secondary/70 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Profit</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const p =
                s.items_sold.reduce((a, i) => a + (i.unit_price - i.cost_price) * i.qty, 0) - s.discount;
              return (
                <tr key={s.id} className="border-t border-border/70">
                  <td className="px-4 py-3 font-medium">{s.invoice_number}</td>
                  <td className="px-4 py-3 text-xs">{new Date(s.date).toLocaleString("en-NG")}</td>
                  <td className="px-4 py-3">{s.items_sold.length}</td>
                  <td className="px-4 py-3">{s.payment_method}</td>
                  <td className="px-4 py-3 font-semibold">{naira(s.total_amount)}</td>
                  <td className="px-4 py-3 text-success">{naira(p)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to="/invoice/$invoiceId"
                      params={{ invoiceId: s.invoice_number }}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium"
                    >
                      View Invoice
                    </Link>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  No sales in this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-2 text-xl font-bold ${accent ? "text-success" : "text-foreground"}`}>{value}</p>
    </div>
  );
}
