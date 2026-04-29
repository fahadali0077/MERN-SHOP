import nodemailer from "nodemailer";
import type { IOrder } from "../models/Order.js";

// ── Transporter — Mailtrap for dev, real SMTP for prod ────────────────────────
const transporter = nodemailer.createTransport({
  host:   process.env["SMTP_HOST"]   ?? "sandbox.smtp.mailtrap.io",
  port:   parseInt(process.env["SMTP_PORT"] ?? "587", 10),
  auth: {
    user: process.env["SMTP_USER"],
    pass: process.env["SMTP_PASS"],
  },
});

interface EmailOptions {
  to:      string;
  subject: string;
  html:    string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  await transporter.sendMail({
    from:    `"MERNShop" <${process.env["SMTP_FROM"] ?? "noreply@mernshop.com"}>`,
    to:      options.to,
    subject: options.subject,
    html:    options.html,
  });
};

// ── Email Templates ───────────────────────────────────────────────────────────

export const orderConfirmationHtml = (
  userName: string,
  order: Pick<IOrder, "items" | "totalAmount"> & { id?: string }
): string => {
  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #f0f0f0">${item.name}</td>
          <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:center">${item.qty}</td>
          <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:right">$${(item.price * item.qty).toFixed(2)}</td>
        </tr>`
    )
    .join("");

  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#333">
      <div style="background:#1a1a1a;padding:24px;text-align:center">
        <h1 style="color:#f59e0b;margin:0;font-size:24px">MERNShop</h1>
      </div>
      <div style="padding:32px 24px">
        <h2 style="margin-top:0">Order Confirmed! 🎉</h2>
        <p>Hi <strong>${userName}</strong>, your order has been placed successfully.</p>
        ${order.id ? `<p style="color:#666;font-size:13px">Order ID: <code>${order.id}</code></p>` : ""}
        <table style="width:100%;border-collapse:collapse;margin:20px 0">
          <thead>
            <tr style="background:#f9f9f9">
              <th style="padding:8px 0;text-align:left;font-size:13px">Item</th>
              <th style="padding:8px 0;text-align:center;font-size:13px">Qty</th>
              <th style="padding:8px 0;text-align:right;font-size:13px">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div style="text-align:right;font-size:18px;font-weight:bold;margin-top:16px">
          Total: $${order.totalAmount.toFixed(2)}
        </div>
        <p style="margin-top:32px;color:#666;font-size:13px">
          You'll receive a shipping update when your order is dispatched.
        </p>
      </div>
      <div style="background:#f9f9f9;padding:16px;text-align:center;font-size:12px;color:#999">
        © ${new Date().getFullYear()} MERNShop. All rights reserved.
      </div>
    </div>
  `;
};

export const passwordResetHtml = (resetUrl: string): string => `
  <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#333">
    <div style="background:#1a1a1a;padding:24px;text-align:center">
      <h1 style="color:#f59e0b;margin:0;font-size:24px">MERNShop</h1>
    </div>
    <div style="padding:32px 24px">
      <h2 style="margin-top:0">Reset Your Password</h2>
      <p>You requested a password reset. Click the button below to set a new password.</p>
      <p>This link expires in <strong>10 minutes</strong>.</p>
      <div style="text-align:center;margin:32px 0">
        <a href="${resetUrl}"
           style="background:#f59e0b;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">
          Reset Password
        </a>
      </div>
      <p style="color:#666;font-size:13px">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  </div>
`;
