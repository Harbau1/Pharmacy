import { Link, useNavigate } from "@tanstack/react-router";
import { BarChart3, Boxes, LayoutDashboard, LogOut, PackagePlus, ShoppingCart } from "lucide-react";
import { useEffect, type ReactNode } from "react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/pos", label: "Sell (POS)", icon: ShoppingCart },
  { to: "/inventory", label: "Inventory", icon: Boxes },
  { to: "/purchases", label: "Stock In", icon: PackagePlus },
  { to: "/reports", label: "Reports", icon: BarChart3 },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("pharmacy_token");
      if (!token) {
        navigate({ to: "/login" });
      }
    }
  }, [navigate]);

  if (typeof window !== "undefined" && !localStorage.getItem("pharmacy_token")) {
    return null;
  }

  const handleLogout = async () => {
    const token = localStorage.getItem("pharmacy_token");

    if (token) {
      try {
        await fetch("http://localhost:3001/api/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch {
        // Ignore backend logout errors and continue local cleanup.
      }
    }

    localStorage.removeItem("pharmacy_token");
    localStorage.removeItem("pharmacy_user");
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="no-print sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-3">
             <img src="/icon-192.png" alt="Premier Plus logo" className="h-11 w-11 shrink-0 object-contain" />
            <span className="leading-tight">
              <span className="block text-sm font-bold tracking-tight text-primary sm:text-base">
                PREMIER PLUS
              </span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Pharmacy &amp; Opticals Ltd
              </span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-primary/10 !text-primary" }}
              >
                {n.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-5 md:pb-10">{children}</main>

      <nav className="no-print fixed bottom-0 left-0 right-0 z-30 grid grid-cols-5 border-t border-border bg-background md:hidden">
        {nav.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            activeOptions={{ exact: n.to === "/" }}
            className="flex flex-col items-center gap-1 py-2 text-[10px] font-medium text-muted-foreground"
            activeProps={{ className: "!text-primary" }}
          >
            <n.icon className="h-5 w-5" />
            {n.label.split(" ")[0]}
          </Link>
        ))}
      </nav>
    </div>
  );
}
