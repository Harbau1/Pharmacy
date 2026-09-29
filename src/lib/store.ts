import { useCallback, useEffect, useState } from "react";
import type { HeldSale, Product, Sale } from "./types";
import { SEED_PRODUCTS, seedSales } from "./seed";

const KEY_P = "ppp_products_v1";
const KEY_S = "ppp_sales_v1";
const KEY_H = "ppp_held_v1";

type Listener = () => void;
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((l) => l());

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  emit();
}

export const db = {
  products: () => read<Product[]>(KEY_P, SEED_PRODUCTS),
  sales: () => read<Sale[]>(KEY_S, seedSales() as Sale[]),
  held: () => read<HeldSale[]>(KEY_H, []),
  setProducts: (p: Product[]) => write(KEY_P, p),
  setSales: (s: Sale[]) => write(KEY_S, s),
  setHeld: (h: HeldSale[]) => write(KEY_H, h),
  reset: () => {
    localStorage.removeItem(KEY_P);
    localStorage.removeItem(KEY_S);
    localStorage.removeItem(KEY_H);
    emit();
  },
};

function useStoreValue<T>(getter: () => T) {
  const [value, setValue] = useState<T | null>(null);
  const refresh = useCallback(() => setValue(getter()), [getter]);
  useEffect(() => {
    refresh();
    const l = () => refresh();
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, [refresh]);
  return value;
}

export function useProducts() {
  return useStoreValue(db.products) ?? null;
}
export function useSales() {
  return useStoreValue(db.sales) ?? null;
}
export function useHeldSales() {
  return useStoreValue(db.held) ?? null;
}

export function saveProduct(product: Product) {
  const list = db.products();
  const idx = list.findIndex((p) => p.id === product.id);
  if (idx >= 0) list[idx] = product;
  else list.unshift(product);
  db.setProducts([...list]);
}

export function deleteProduct(id: string) {
  db.setProducts(db.products().filter((p) => p.id !== id));
}

export function adjustStock(id: string, delta: number) {
  db.setProducts(
    db.products().map((p) =>
      p.id === id ? { ...p, quantity_in_stock: Math.max(0, p.quantity_in_stock + delta) } : p,
    ),
  );
}

export function nextInvoiceNumber() {
  const sales = db.sales();
  const max = sales.reduce((m, s) => {
    const n = Number(s.invoice_number.replace(/\D/g, ""));
    return Number.isFinite(n) && n > m ? n : m;
  }, 1000);
  return `PP-${max + 1}`;
}

export function completeSale(sale: Sale) {
  db.setSales([sale, ...db.sales()]);
  const products = db.products().map((p) => {
    const line = sale.items_sold.find((i) => i.product_id === p.id);
    return line ? { ...p, quantity_in_stock: Math.max(0, p.quantity_in_stock - line.qty) } : p;
  });
  db.setProducts(products);
}

export function newProductId() {
  return `P${Date.now().toString(36).toUpperCase()}`;
}

// helpers
export const naira = (n: number) =>
  `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export function daysToExpiry(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

export type StockStatus = "in" | "low" | "out" | "expired";

export function stockStatus(p: Product): StockStatus {
  if (daysToExpiry(p.expiry_date) < 0) return "expired";
  if (p.quantity_in_stock <= 0) return "out";
  if (p.quantity_in_stock <= p.min_stock_level) return "low";
  return "in";
}
