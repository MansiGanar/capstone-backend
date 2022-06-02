import Product from "../../../models/Product.js";
import express from "express";

const router = express.Router();

// @route       GET /api/users/products/:category
// @desc        Get all propducts
// @access      Public
router.get("/:category", async (req, res) => {
  try {
    let products = await Product.find({ category: [req.params.category] });

    if (!products) {
      res
        .status(400)
        .json({ msg: "An error occurred. Please refresh the page." });
    } else {
      res.json({
        msg: "All products fetched successfully.",
        products,
      });
    }
  } catch (error) {
    res.status(400).json({
      msg: "Failed to fetch all products. Please refresh the page.",
    });
  }
});

// @route       GET /api/users/products/:productID
// @desc        Get a product
// @access      Public
router.get("/:productID", async (req, res) => {
  const { productID } = req.params;

  try {
    let product = await Product.findOne({ _id: productID });

    if (!product) {
      res.status(400).json({ msg: "No such product found." });
    } else {
      res.json(product);
    }
  } catch (error) {
    res.status(400).json({
      msg: "Failed to fetch the product. Please try again.",
    });
  }
});

export default router;
