# Premier Pharmacy Hub

Build a full-stack web application for PREMIER PLUS PHARMACY & OPTICALS LTD - a Pharmacy Point of Sale and Inventory Management System.



BUSINESS NAME: PREMIER PLUS PHARMACY & OPTICALS LTD

TYPE: Retail Pharmacy + Optical Shop + Wholesale



TECH STACK: Use React for frontend, Tailwind CSS for styling, and LocalStorage / Firebase / Supabase for database. Make it responsive and installable as a PWA.



DATABASE SCHEMA:

1. Products Table: id, name, generic_name, category (Drug, Opticals, Consumables), barcode, quantity_in_stock, cost_price, retail_price, wholesale_price, expiry_date, supplier, shelf_location, min_stock_level

2. Sales Table: id, invoice_number, date, items_sold (array), total_amount, payment_method, price_type (retail/wholesale), sold_by

3. Customers Table (optional): name, phone



FEATURE 1: DASHBOARD

- Show 4 cards at top: Total Items in Stock, Out of Stock Items, Items Expiring in 30 days, Today's Sales (NGN)

- Show charts for: Weekly Sales (Bar Chart Mon-Sun), Monthly Sales (Line Chart Jan-Dec), Top Selling Items

- Search bar to search any product instantly



FEATURE 2: INVENTORY / STOCK MANAGEMENT

- Table showing all items: Name | Qty Balance | Cost Price | Retail Price | Wholesale Price | Expiry | Status

- Color code: Green = In Stock, Yellow = Low Stock (below min level), Red = Out of Stock / Expired

- Buttons: Add New Item, Edit Item, Delete Item, Update Stock (Add/Remove quantity)

- When editing, I can update ANY field easily: name, quantity, cost price, retail price, wholesale price.



FEATURE 3: SMART POS / SELLING SCREEN (MOST IMPORTANT)

- Left side: A search input "Type item name...". As I type letters (e.g. "para"), show a dropdown list of matching items from inventory.

- Each suggestion must show: Item Name | Qty Available | Cost Price | Retail Price | Wholesale Price

- On clicking an item, add it to cart. In cart I can change quantity and choose whether to sell at Retail or Wholesale price.

- Right side: Cart summary with Subtotal, Discount, Grand Total.

- Buttons: Hold Sale, Print Invoice, Complete Sale. When sale is completed, automatically deduct from stock balance.



FEATURE 4: PURCHASE / STOCK IN

- When new stock arrives, I can search for existing item and just increase quantity and update prices if needed.



FEATURE 5: REPORTS & INVOICING

- Reports page to filter sales by: Today, This Week, This Month, Custom Date Range.

- Show total profit: (Selling Price - Cost Price) * Quantity.

- Invoice Page: Professional invoice with:

  Logo: PREMIER PLUS PHARMACY & OPTICALS LTD

  Address, Phone, Date, Invoice No

  Table of items, Qty, Price Type, Amount

  Total Amount

  "Thank you for your patronage" footer

- Include a PRINT button that formats for thermal receipt printer and A4.



DESIGN: Professional, clean, medical-themed. Colors: White background with Blue (#0E4DA4) and Green (#00A651) as primary colors. Use easy-to-read fonts.



Build all features fully functional with dummy data for 50 pharmacy items (like Paracetamol, Amoxicillin, Eye Glasses, etc.) so I can test immediately.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/52bc0cb5-ccbd-4c7d-8e5f-01298280a9b0).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
