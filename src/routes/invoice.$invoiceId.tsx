import { createFileRoute, Link } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { naira, useSales } from "@/lib/store";


export const Route = createFileRoute("/invoice/$invoiceId")({
  head: () => ({
    meta: [
      { title: "Invoice — Premier Plus Pharmacy & Opticals Ltd" },
      {
        name: "description",
        content: "Printable A4 and thermal receipt invoice for Premier Plus Pharmacy & Opticals Ltd.",
      },
      { property: "og:title", content: "Invoice — Premier Plus Pharmacy" },
      { property: "og:description", content: "Printable customer invoice and receipt." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InvoicePage,
});

function InvoicePage() {
  const { invoiceId } = Route.useParams();
  const sales = useSales();
  const sale = sales?.find((s) => s.invoice_number === invoiceId);

  if (!sales) return <p className="p-8 text-sm text-muted-foreground">Loading invoice…</p>;

  if (!sale) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-8">
        <p className="text-sm text-muted-foreground">Invoice {invoiceId} was not found.</p>
        <Link to="/reports" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Back to Reports
        </Link>
      </div>
    );
  }

  const subtotal = sale.items_sold.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="min-h-screen bg-secondary/40 py-6 print:bg-white print:py-0">
      <div className="no-print mx-auto mb-4 flex max-w-[820px] items-center justify-between px-4">
        <Link to="/reports" className="text-sm font-medium text-primary">
          ← Back to Reports
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          <Printer className="h-4 w-4" /> Print Invoice
        </button>
      </div>

      <div className="mx-auto max-w-[820px] bg-card px-6 py-8 shadow-sm print:max-w-none print:shadow-none">
        <div className="flex flex-col gap-4 border-b-2 border-primary pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <img src="/icon-192.png" alt="Premier Plus Pharmacy & Opticals logo" className="h-auto w-28 shrink-0 object-contain sm:w-36" />
            <div>
              <h1 className="text-lg font-extrabold uppercase tracking-tight text-primary sm:text-xl">
                Premier Plus Pharmacy &amp; Opticals Ltd
              </h1>
              <p className="text-xs text-muted-foreground">
                Retail Pharmacy · Optical Shop · Wholesale Distribution
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Kabuga, Janbulo 1st gate line Opp.Pedestrian gate BUK old Site Kano · Tel: 08036047550
              </p>
            </div>
          </div>
          <div className="text-sm sm:text-right">
            <p className="font-bold uppercase tracking-widest text-success">Invoice</p>
            <p className="text-xs text-muted-foreground">No: {sale.invoice_number}</p>
            <p className="text-xs text-muted-foreground">
              Date: {new Date(sale.date).toLocaleString("en-NG")}
            </p>
            <p className="text-xs text-muted-foreground">Served by: {sale.sold_by}</p>
          </div>
        </div>

        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
              <th className="py-2">Item</th>
              <th className="py-2">Qty</th>
              <th className="py-2">Price Type</th>
              <th className="py-2 text-right">Unit</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {sale.items_sold.map((i, idx) => (
              <tr key={idx} className="border-b border-border/60">
                <td className="py-2.5">{i.name}</td>
                <td className="py-2.5">{i.qty}</td>
                <td className="py-2.5 capitalize">{i.price_type}</td>
                <td className="py-2.5 text-right">{naira(i.unit_price)}</td>
                <td className="py-2.5 text-right font-medium">{naira(i.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 ml-auto w-full max-w-xs space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{naira(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Discount</span>
            <span>-{naira(sale.discount)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
            <span>Total Amount</span>
            <span className="text-primary">{naira(sale.total_amount)}</span>
          </div>
          <p className="text-xs text-muted-foreground">Paid via {sale.payment_method}</p>
        </div>

        <p className="mt-10 border-t border-dashed border-border pt-4 text-center text-sm font-medium text-success">
          Thank you for your patronage
        </p>
        <p className="text-center text-[10px] text-muted-foreground">
          Goods sold in good condition are not returnable except on pharmacist advice.
        </p>
      </div>
    </div>
  );
}
