export type Category = "Drug" | "Opticals" | "Consumables";
export type PriceType = "retail" | "wholesale";

export interface Product {
  id: string;
  name: string;
  generic_name: string;
  category: Category;
  barcode: string;
  quantity_in_stock: number;
  cost_price: number;
  retail_price: number;
  wholesale_price: number;
  expiry_date: string; // yyyy-mm-dd
  supplier: string;
  shelf_location: string;
  min_stock_level: number;
}

export interface SaleItem {
  product_id: string;
  name: string;
  qty: number;
  price_type: PriceType;
  unit_price: number;
  cost_price: number;
  amount: number;
}

export interface Sale {
  id: string;
  invoice_number: string;
  date: string; // ISO
  items_sold: SaleItem[];
  discount: number;
  total_amount: number;
  payment_method: string;
  price_type: PriceType;
  sold_by: string;
}

export interface HeldSale {
  id: string;
  date: string;
  items: SaleItem[];
  discount: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
}
