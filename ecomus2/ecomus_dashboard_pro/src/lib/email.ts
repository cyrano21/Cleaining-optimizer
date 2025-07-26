import { Resend } from "resend";
import Order, { IOrder } from "@/models/Order";
import Store, { StoreDocument } from "@/models/Store";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendOrderConfirmation(orderId: string, locale: "fr" | "en" = "fr") {
  const order = await Order.findById(orderId).lean() as IOrder | null;
  if (!order) return;

  const store = await Store.findById(order.store).lean() as StoreDocument | null;
  if (!store) return;

  const html = `
    <div style="font-family: sans-serif; color:#333;">
      ${store.logoUrl ? `<img src="${store.logoUrl}" alt="${store.name}" style="max-width:140px;margin-bottom:16px;">` : ""}
      <h1 style="color:${store.primaryColor};">Merci pour votre commande !</h1>
      <p>Numéro de commande : ${orderId}</p>
      <p>Total : <strong>${order.total.toFixed(2)} €</strong></p>
    </div>
  `;

  await resend.emails.send({
    from: `${store.name} <no-reply@${store.slug}.com>`,
    to: order.customerEmail || 'customer@example.com',
    subject: "Confirmation de commande",
    html
  });
}
