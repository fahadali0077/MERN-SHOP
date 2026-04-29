import { Schema, model, type Document, type Types } from "mongoose";

interface OrderItem {
  product: Types.ObjectId;
  name: string;
  image: string;
  price: number;
  qty: number;
}

export interface IOrder extends Document {
  user: Types.ObjectId;
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress?: {
    street: string;
    city: string;
    country: string;
  };
}

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Order must belong to a user"],
    },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        name:    { type: String, required: true },
        image:   { type: String },
        price:   { type: Number, required: true, min: 0 },
        qty:     { type: Number, required: true, min: 1 },
      },
    ],
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    shippingAddress: {
      street:  { type: String },
      city:    { type: String },
      country: { type: String },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret["id"] = (ret["_id"] as { toString(): string }).toString();
        delete ret["_id"];
        delete ret["__v"];
        return ret;
      },
    },
  }
);

// Index for fast user order lookups
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

export const Order = model<IOrder>("Order", orderSchema);
