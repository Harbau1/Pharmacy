import { db } from "./store";
import { isSupabaseConfigured, supabase } from "./supabase";
import type { HeldSale, Product, Sale } from "./types";

/**
 * Hydrates local cache (localStorage) directly from Supabase.
 * Whatever exists in Supabase (even if empty after deletion) is authoritative.
 */
export async function syncFromSupabase(): Promise<{ success: boolean; message?: string }> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase is not configured yet. Using local database cache.");
    return { success: false, message: "Supabase credentials not configured." };
  }

  try {
    // 1. Sync Products
    const { data: remoteProducts, error: pError } = await supabase
      .from("products")
      .select("*")
      .order("name", { ascending: true });

    if (pError) {
      console.error("Failed to fetch products from Supabase:", pError);
    } else {
      // Always sync local cache to match Supabase state
      db.setProducts((remoteProducts as Product[]) || []);
    }

    // 2. Sync Sales
    const { data: remoteSales, error: sError } = await supabase
      .from("sales")
      .select("*")
      .order("date", { ascending: false });

    if (sError) {
      console.error("Failed to fetch sales from Supabase:", sError);
    } else {
      // Always sync local sales cache to match Supabase state
      db.setSales((remoteSales as Sale[]) || []);
    }

    // 3. Sync Held Sales
    const { data: remoteHeld, error: hError } = await supabase
      .from("held_sales")
      .select("*")
      .order("date", { ascending: false });

    if (hError) {
      console.error("Failed to fetch held sales from Supabase:", hError);
    } else {
      db.setHeld((remoteHeld as HeldSale[]) || []);
    }

    return { success: true };
  } catch (err) {
    console.error("Error during Supabase synchronization:", err);
    return { success: false, message: "Sync error occurred." };
  }
}

/**
 * Syncs a single product upsert to Supabase in the background.
 */
export async function syncProductToSupabase(product: Product): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const { error } = await supabase.from("products").upsert({
      id: product.id,
      name: product.name,
      generic_name: product.generic_name,
      category: product.category,
      barcode: product.barcode,
      quantity_in_stock: product.quantity_in_stock,
      cost_price: product.cost_price,
      retail_price: product.retail_price,
      wholesale_price: product.wholesale_price,
      expiry_date: product.expiry_date,
      supplier: product.supplier,
      shelf_location: product.shelf_location,
      min_stock_level: product.min_stock_level,
      updated_at: new Date().toISOString(),
    });
    if (error) console.error("Error upserting product to Supabase:", error);
  } catch (err) {
    console.error("Background product sync error:", err);
  }
}

/**
 * Syncs product deletion to Supabase in the background.
 */
export async function deleteProductFromSupabase(id: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) console.error("Error deleting product from Supabase:", error);
  } catch (err) {
    console.error("Background product deletion sync error:", err);
  }
}

/**
 * Syncs completed sale and updated product stock levels to Supabase.
 */
export async function syncSaleToSupabase(sale: Sale, updatedProducts: Product[]): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    // Insert sale record
    const { error: saleErr } = await supabase.from("sales").insert({
      id: sale.id,
      invoice_number: sale.invoice_number,
      date: sale.date,
      items_sold: sale.items_sold,
      discount: sale.discount,
      total_amount: sale.total_amount,
      payment_method: sale.payment_method,
      price_type: sale.price_type,
      sold_by: sale.sold_by,
    });
    if (saleErr) console.error("Error inserting sale to Supabase:", saleErr);

    // Update affected products stock levels
    for (const prod of updatedProducts) {
      await syncProductToSupabase(prod);
    }
  } catch (err) {
    console.error("Background sale sync error:", err);
  }
}

/**
 * Syncs held sales list to Supabase.
 */
export async function syncHeldSalesToSupabase(heldList: HeldSale[]): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    // Delete all current held sales and insert fresh held list
    await supabase.from("held_sales").delete().neq("id", "");
    if (heldList.length > 0) {
      await supabase.from("held_sales").insert(heldList);
    }
  } catch (err) {
    console.error("Background held sales sync error:", err);
  }
}
