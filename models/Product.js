const { Decimal128 } = require("mongodb");
const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Decimal128,
    required: true,
  },
  rating: {
    type: String,
  },
  category: {
    type: [String],
    required: true,
  },
});

module.exports = mongoose.model("product", ProductSchema);
