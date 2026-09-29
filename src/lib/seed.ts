import type { Product } from "./types";

function d(days: number) {
  const dt = new Date();
  dt.setDate(dt.getDate() + days);
  return dt.toISOString().slice(0, 10);
}

type Row = [string, string, Product["category"], number, number, number, number, number, string];

// name, generic, category, qty, cost, retail, wholesale, expiryOffsetDays, supplier
const rows: Row[] = [
  ["Paracetamol 500mg Tabs", "Acetaminophen", "Drug", 240, 350, 600, 480, 400, "Emzor"],
  ["Amoxicillin 500mg Caps", "Amoxicillin", "Drug", 120, 900, 1500, 1250, 300, "Fidson"],
  ["Ampiclox 500mg Caps", "Ampicillin/Cloxacillin", "Drug", 85, 1100, 1800, 1500, 210, "Beecham"],
  ["Ibuprofen 400mg Tabs", "Ibuprofen", "Drug", 160, 400, 750, 600, 500, "Emzor"],
  ["Diclofenac 50mg Tabs", "Diclofenac Sodium", "Drug", 95, 450, 850, 700, 330, "Juhel"],
  ["Artemether/Lumefantrine", "Coartem 80/480", "Drug", 60, 1800, 3000, 2600, 260, "Novartis"],
  ["Lonart DS", "Artemether/Lumefantrine", "Drug", 42, 2000, 3200, 2800, 190, "Greenlife"],
  ["Chloramphenicol Eye Drop", "Chloramphenicol", "Drug", 70, 500, 950, 800, 240, "Drugfield"],
  ["Ciprofloxacin 500mg", "Ciprofloxacin", "Drug", 110, 800, 1400, 1150, 400, "Fidson"],
  ["Metronidazole 400mg", "Metronidazole", "Drug", 200, 300, 600, 480, 350, "Juhel"],
  ["Vitamin C 100mg Tabs", "Ascorbic Acid", "Drug", 300, 250, 500, 400, 600, "Emzor"],
  ["Multivite Tabs", "Multivitamin", "Drug", 180, 300, 650, 520, 450, "Vitabiotics"],
  ["Folic Acid 5mg", "Folic Acid", "Drug", 150, 200, 450, 350, 520, "Emzor"],
  ["Ferrous Sulphate Tabs", "Ferrous Sulphate", "Drug", 90, 350, 700, 560, 300, "Juhel"],
  ["Loratadine 10mg", "Loratadine", "Drug", 75, 400, 800, 650, 380, "Swipha"],
  ["Cetirizine 10mg", "Cetirizine", "Drug", 0, 380, 750, 600, 290, "Swipha"],
  ["Omeprazole 20mg Caps", "Omeprazole", "Drug", 64, 700, 1300, 1050, 310, "Fidson"],
  ["Magnesium Trisilicate", "Antacid", "Drug", 48, 500, 950, 780, 150, "Drugfield"],
  ["Hydrochlorothiazide 25mg", "HCTZ", "Drug", 55, 450, 900, 720, 340, "Swipha"],
  ["Amlodipine 5mg", "Amlodipine", "Drug", 130, 600, 1200, 980, 420, "Fidson"],
  ["Lisinopril 10mg", "Lisinopril", "Drug", 88, 700, 1350, 1100, 400, "Emzor"],
  ["Metformin 500mg", "Metformin HCl", "Drug", 140, 550, 1050, 860, 360, "Juhel"],
  ["Glibenclamide 5mg", "Glibenclamide", "Drug", 4, 400, 800, 640, 200, "Swipha"],
  ["Cough Syrup 100ml", "Guaifenesin", "Drug", 66, 700, 1300, 1050, 170, "Emzor"],
  ["Benylin Syrup", "Diphenhydramine", "Drug", 35, 1500, 2500, 2100, 220, "J&J"],
  ["ORS Sachet", "Oral Rehydration Salt", "Consumables", 400, 120, 300, 220, 500, "UNICEF"],
  ["Zinc Tabs 20mg", "Zinc Sulphate", "Drug", 210, 200, 450, 350, 460, "Emzor"],
  ["Hand Sanitizer 250ml", "Ethanol Gel", "Consumables", 80, 600, 1200, 950, 700, "Dettol"],
  ["Surgical Face Mask (50pcs)", "Face Mask", "Consumables", 45, 1200, 2500, 2000, 900, "MedPlus"],
  ["Examination Gloves (100pcs)", "Latex Gloves", "Consumables", 30, 4000, 6500, 5500, 800, "Supermax"],
  ["Cotton Wool 100g", "Absorbent Cotton", "Consumables", 60, 500, 1000, 800, 900, "Drugfield"],
  ["Elastic Bandage 4in", "Crepe Bandage", "Consumables", 25, 700, 1400, 1150, 900, "MedPlus"],
  ["Adhesive Plaster Strip", "Plaster", "Consumables", 120, 150, 350, 260, 800, "Hansaplast"],
  ["Methylated Spirit 100ml", "Denatured Alcohol", "Consumables", 70, 300, 650, 520, 600, "Drugfield"],
  ["Hydrogen Peroxide 100ml", "H2O2", "Consumables", 0, 350, 700, 560, 20, "Drugfield"],
  ["Digital Thermometer", "Thermometer", "Consumables", 18, 2500, 4500, 3800, 1200, "Omron"],
  ["BP Monitor Digital", "Sphygmomanometer", "Consumables", 8, 22000, 32000, 28000, 1500, "Omron"],
  ["Glucometer Kit", "Blood Glucose Meter", "Consumables", 6, 15000, 23000, 20000, 1100, "Accu-Chek"],
  ["Glucose Test Strips (50)", "Test Strips", "Consumables", 14, 6000, 9500, 8200, 240, "Accu-Chek"],
  ["Disposable Syringe 5ml", "Syringe", "Consumables", 300, 60, 150, 110, 900, "Jiangsu"],
  ["Reading Glasses +1.50", "Reading Glasses", "Opticals", 22, 2500, 6000, 4800, 3000, "OptiWorld"],
  ["Reading Glasses +2.00", "Reading Glasses", "Opticals", 19, 2500, 6000, 4800, 3000, "OptiWorld"],
  ["Anti-Glare Computer Glasses", "Blue Light Glasses", "Opticals", 26, 4500, 9500, 7800, 3000, "OptiWorld"],
  ["Sunglasses UV400 Classic", "Sunglasses", "Opticals", 34, 3500, 8000, 6500, 3000, "RayGuard"],
  ["Prescription Frame Metal", "Eye Frame", "Opticals", 12, 6000, 14000, 11500, 3000, "VisionPro"],
  ["Prescription Frame Plastic", "Eye Frame", "Opticals", 3, 4000, 9000, 7500, 3000, "VisionPro"],
  ["Single Vision Lens (pair)", "Optical Lens", "Opticals", 40, 3500, 8500, 7000, 3000, "Essilor"],
  ["Photochromic Lens (pair)", "Optical Lens", "Opticals", 16, 9000, 18000, 15000, 3000, "Essilor"],
  ["Contact Lens Solution 120ml", "Saline Solution", "Opticals", 28, 1800, 3500, 2900, 280, "Bausch"],
  ["Lens Cleaning Cloth", "Microfiber Cloth", "Opticals", 90, 200, 600, 420, 3000, "OptiWorld"],
];

export const SEED_PRODUCTS: Product[] = rows.map((r, i) => ({
  id: `P${String(i + 1).padStart(3, "0")}`,
  name: r[0],
  generic_name: r[1],
  category: r[2],
  barcode: `615${String(100000 + i * 7)}`,
  quantity_in_stock: r[3],
  cost_price: r[4],
  retail_price: r[5],
  wholesale_price: r[6],
  expiry_date: d(r[7]),
  supplier: r[8],
  shelf_location: `${r[2] === "Opticals" ? "OPT" : r[2] === "Consumables" ? "CON" : "SHF"}-${Math.floor(i / 6) + 1}${String.fromCharCode(65 + (i % 6))}`,
  min_stock_level: r[2] === "Opticals" ? 5 : 20,
}));

export function seedSales() {
  const sales = [] as {
    id: string;
    invoice_number: string;
    date: string;
    items_sold: {
      product_id: string;
      name: string;
      qty: number;
      price_type: "retail" | "wholesale";
      unit_price: number;
      cost_price: number;
      amount: number;
    }[];
    discount: number;
    total_amount: number;
    payment_method: string;
    price_type: "retail" | "wholesale";
    sold_by: string;
  }[];
  let n = 1;
  for (let back = 200; back >= 0; back--) {
    const count = back < 30 ? 1 + Math.floor(Math.random() * 4) : Math.random() < 0.4 ? 1 : 0;
    for (let k = 0; k < count; k++) {
      const date = new Date();
      date.setDate(date.getDate() - back);
      date.setHours(9 + Math.floor(Math.random() * 9), Math.floor(Math.random() * 59));
      const items = [] as (typeof sales)[number]["items_sold"];
      const lines = 1 + Math.floor(Math.random() * 3);
      for (let j = 0; j < lines; j++) {
        const p = SEED_PRODUCTS[Math.floor(Math.random() * SEED_PRODUCTS.length)]!;
        const priceType: "retail" | "wholesale" = Math.random() < 0.8 ? "retail" : "wholesale";
        const unit = priceType === "retail" ? p.retail_price : p.wholesale_price;
        const qty = 1 + Math.floor(Math.random() * 4);
        items.push({
          product_id: p.id,
          name: p.name,
          qty,
          price_type: priceType,
          unit_price: unit,
          cost_price: p.cost_price,
          amount: unit * qty,
        });
      }
      const total = items.reduce((s, i) => s + i.amount, 0);
      sales.push({
        id: `S${n}`,
        invoice_number: `PP-${String(1000 + n)}`,
        date: date.toISOString(),
        items_sold: items,
        discount: 0,
        total_amount: total,
        payment_method: ["Cash", "POS", "Transfer"][Math.floor(Math.random() * 3)]!,
        price_type: items[0]!.price_type,
        sold_by: "Counter Staff",
      });
      n++;
    }
  }
  return sales;
}
