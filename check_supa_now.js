import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envText = fs.readFileSync(".env", "utf-8");
let url = "";
let key = "";
for (const line of envText.split("\n")) {
  if (line.startsWith("VITE_SUPABASE_URL=")) url = line.replace("VITE_SUPABASE_URL=", "").trim();
  if (line.startsWith("VITE_SUPABASE_ANON_KEY=")) key = line.replace("VITE_SUPABASE_ANON_KEY=", "").trim();
}

const supabase = createClient(url, key);

async function check() {
  console.log("Checking Supabase 'products' table right now...");
  const { data, error } = await supabase.from("products").select("*");
  if (error) {
    console.log("❌ Error querying products:", error.message);
  } else {
    console.log("✅ Products returned from Supabase:", data.length, "items.");
    if (data.length > 0) {
      console.log("Sample items in Supabase:", data.slice(0, 3).map(p => p.name));
    }
  }

  console.log("Checking Supabase 'sales' table right now...");
  const { data: sales, error: sErr } = await supabase.from("sales").select("*");
  if (sErr) console.log("❌ Sales error:", sErr.message);
  else console.log("✅ Sales returned from Supabase:", sales.length, "items.");
}

check();
