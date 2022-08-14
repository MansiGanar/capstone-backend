import { ObjectId } from "mongodb";
import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  streetName: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: true,
  },
  totalCost: {
    type: String,
    required: true,
  },
  deliveryMethod: {
    type: String,
    required: true,
  },
  orderItems: { type: Array, required: true },
  date: { type: String, required: true },
  status: { type: String, required: true, default: "In progress" },
  userId: {
    type: ObjectId,
    required: true,
  },
});

const Order = mongoose.model("Order", OrderSchema);
export default Order;
