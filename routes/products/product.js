import Product from "../../models/Product.js";
import express from "express";
import { check, validationResult } from "express-validator";

const router = express.Router();

// @route       GET /api/products
// @desc        Get all propducts
// @access      Public
router.get("/", async (req, res) => {
  try {
    let products = await Product.find();

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

// @route       POST /api/products
// @desc        Add a new product
// @access      Public
router.post(
  "/",
  [
    check("name", "Please enter a name.").exists(),
    check("quantity", "Please enter a quantity.").exists(),
    check("price", "Please enter a price.").exists(),
    check("description", "Please enter a description.").exists(),
    check("image", "Please enter a image.").exists(),
    check("rating", "Please enter a rating.").exists(),
    check("category", "Please enter a category.").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, quantity, price, description, image, rating, category } =
      req.body;

    try {
      let productExists = await Product.findOne({ name: name });

      if (productExists) {
        res.status(400).json({ msg: "An error occurred. Please try again." });
      } else {
        let product = new Product({
          name,
          quantity,
          price,
          description,
          image,
          rating,
          category,
        });

        await product.save();

        res.json({
          msg: "Product added successfully.",
          product,
        });
      }
    } catch (error) {
      res
        .status(400)
        .json({ msg: "Failed to add a new product. Please try again." });
    }
  }
);

// @route       GET /api/products/productID
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

// @route       GET /api/products/productID
// @desc        Get a product
// @access      Public
router.delete("/:productID", async (req, res) => {
  const { productID } = req.params;

  try {
    let product = await Product.findOne({ _id: productID });

    if (!product) {
      res.status(400).json({ msg: "No such product found." });
    } else {
      await Product.findOneAndRemove({ productID: productID });

      res.json({
        msg: "Product removed successfully.",
      });
    }
  } catch (error) {
    res
      .status(400)
      .json({ msg: "Failed to remove the product. Please try again." });
  }
});

export default router;
