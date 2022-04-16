const mongoose = require("mongoose");

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
  deliveryAddress: {
    type: String,
    required: true,
  },
  deliveryMethod: {
    type: String,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  totalCost: {
    type: String,
    required: true,
  },
  orderItems: { type: Array, required: true },
  date: { type: String, required: true },
  status: { type: String, required: true, default: "In progress" },
});

global.OrderSchema = global.OrderSchema || mongoose.model("order", OrderSchema);

module.exports = global.OrderSchema;
