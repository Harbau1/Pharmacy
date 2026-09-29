import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, CalendarClock, PackageX, RefreshCw, Search, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { useProducts, useSales, naira, daysToExpiry, stockStatus, hydrateFromSupabase } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Premier Plus Pharmacy & Opticals Ltd" },
      {
        name: "description",
        content: "Live stock, expiry alerts and daily sales for Premier Plus Pharmacy & Opticals.",
      },
      { property: "og:title", content: "Dashboard — Premier Plus Pharmacy" },
      { property: "og:description", content: "Live stock, expiry alerts and daily sales." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Card({
  label,
  value,
  sub,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  icon: typeof Search;
  tone: "primary" | "destructive" | "warning" | "success";
}) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    destructive: "bg-destructive/10 text-destructive",
    warning: "bg-warning/20 text-warning-foreground",
    success: "bg-success/15 text-success",
  } as const;
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <span className={`rounded-lg p-2 ${tones[tone]}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function Dashboard() {
  const products = useProducts();
  const sales = useSales();
  const [q, setQ] = useState("");
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    hydrateFromSupabase().catch(() => {});
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    const res = await hydrateFromSupabase();
    setSyncing(false);
    if (res.success) toast.success("Data synced with Supabase");
    else toast.error(res.message || "Sync failed");
  };

  const stats = useMemo(() => {
    if (!products || !sales) return null;
    const totalUnits = products.reduce((s, p) => s + p.quantity_in_stock, 0);
    const outOfStock = products.filter((p) => p.quantity_in_stock <= 0).length;
    const expiring = products.filter((p) => {
      const d = daysToExpiry(p.expiry_date);
      return d >= 0 && d <= 30;
    }).length;
    const today = new Date().toDateString();
    const todaySales = sales
      .filter((s) => new Date(s.date).toDateString() === today)
      .reduce((s, x) => s + x.total_amount, 0);

    const weekly = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => ({ day: d, total: 0 }));
    const now = new Date();
    const monday = new Date(now);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    sales.forEach((s) => {
      const dt = new Date(s.date);
      if (dt >= monday) {
        const idx = (dt.getDay() + 6) % 7;
        weekly[idx]!.total += s.total_amount;
      }
    });

    const monthly = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ].map((m) => ({ month: m, total: 0 }));
    sales.forEach((s) => {
      const dt = new Date(s.date);
      if (dt.getFullYear() === now.getFullYear()) monthly[dt.getMonth()]!.total += s.total_amount;
    });

    const tally = new Map<string, number>();
    sales.forEach((s) =>
      s.items_sold.forEach((i) => tally.set(i.name, (tally.get(i.name) ?? 0) + i.qty)),
    );
    const top = [...tally.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, qty]) => ({ name: name.length > 18 ? name.slice(0, 18) + "…" : name, qty }));

    return { totalUnits, outOfStock, expiring, todaySales, weekly, monthly, top };
  }, [products, sales]);

  const results = useMemo(() => {
    if (!products || q.trim().length < 1) return [];
    const t = q.toLowerCase();
    return products
      .filter((p) => p.name.toLowerCase().includes(t) || p.generic_name.toLowerCase().includes(t))
      .slice(0, 8);
  }, [products, q]);

  return (
    <AppShell>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of stock and sales performance</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm font-medium text-foreground shadow-sm hover:bg-secondary disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync DB"}
          </button>
          <Link
            to="/pos"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            New Sale
          </Link>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search any product instantly…"
          className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm outline-none focus:border-primary"
        />
        {results.length > 0 && (
          <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-border bg-card shadow-lg">
            {results.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-2.5 text-sm last:border-0"
              >
                <div>
                  <p className="font-medium text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.category} · Shelf {p.shelf_location} · Exp {p.expiry_date}
                  </p>
                </div>
                <div className="text-right text-xs">
                  <p className="font-semibold text-foreground">{naira(p.retail_price)}</p>
                  <p
                    className={
                      stockStatus(p) === "in" ? "text-success" : "text-destructive font-medium"
                    }
                  >
                    {p.quantity_in_stock} in stock
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!stats ? (
        <p className="text-sm text-muted-foreground">Loading data…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Card
              label="Total Items in Stock"
              value={stats.totalUnits.toLocaleString()}
              sub={`${products?.length ?? 0} product lines`}
              icon={TrendingUp}
              tone="primary"
            />
            <Card
              label="Out of Stock"
              value={String(stats.outOfStock)}
              sub="Needs restocking"
              icon={PackageX}
              tone="destructive"
            />
            <Card
              label="Expiring in 30 days"
              value={String(stats.expiring)}
              sub="Check shelves"
              icon={CalendarClock}
              tone="warning"
            />
            <Card
              label="Today's Sales"
              value={naira(stats.todaySales)}
              sub="All payment methods"
              icon={AlertTriangle}
              tone="success"
            />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <ChartBox title="Weekly Sales (Mon – Sun)">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.weekly}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} width={50} />
                  <Tooltip formatter={(v: number) => naira(v)} />
                  <Bar dataKey="total" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartBox>

            <ChartBox title="Monthly Sales (Jan – Dec)">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={stats.monthly}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} width={50} />
                  <Tooltip formatter={(v: number) => naira(v)} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="var(--success)"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartBox>

            <ChartBox title="Top Selling Items" className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.top} layout="vertical" margin={{ left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                  <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" width={130} fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(v: number) => `${v} units`} />
                  <Bar dataKey="qty" fill="var(--success)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartBox>
          </div>
        </>
      )}
    </AppShell>
  );
}

function ChartBox({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-4 shadow-sm ${className}`}>
      <h2 className="mb-4 text-sm font-semibold text-foreground">{title}</h2>
      {children}
    </div>
  );
}
