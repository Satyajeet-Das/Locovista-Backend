import mongoose, { Schema, Document, Types } from "mongoose";
import { IOrderItem, IOrder } from "../../types/model";

// Enum for order status
export enum OrderStatus {
    Pending = "Pending",
    Confirmed = "Confirmed",
    Shipped = "Shipped",
    Delivered = "Delivered",
    Cancelled = "Cancelled",
  }

const OrderItemSchema: Schema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { _id: false } // Prevents creating a separate _id for subdocuments
);

// Main Order schema
const OrderSchema: Schema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    orderItems: { type: [OrderItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    discountAmount: { type: Number },
    shippingAddress: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    orderStatus: { 
      type: String, 
      enum: Object.values(OrderStatus), 
      default: OrderStatus.Pending 
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

export default mongoose.model<IOrder>("Order", OrderSchema);
