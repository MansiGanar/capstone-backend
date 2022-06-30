import Product from "../../../models/Product.js";
import express from "express";
import { check, validationResult } from "express-validator";
import auth from "../../../middleware/auth.js";
import { multerUploads } from "../../../utils/uploads/index.js";

const router = express.Router();

// @route       GET /api/administrator/products/category/:category
// @desc        Get all products in this category
// @access      Public
router.get("/category/:category", async (req, res) => {
  try {
    let products = await Product.find({ category: req.params.category });

    if (!products) {
      res
        .status(400)
        .json({ msg: "An error occurred. Please refresh the page." });
    } else {
      res.json({
        msg: "All products fetched.",
        products,
      });
    }
  } catch (error) {
    res.status(400).json({
      msg: "Failed to fetch all products. Please refresh the page.",
    });
  }
});

// @route       GET /api/administrator/products/all
// @desc        Get all propducts
// @access      Private
router.get("/all", auth, async (req, res) => {
  try {
    let products = await Product.find();

    if (!products) {
      res
        .status(400)
        .json({ msg: "An error occurred. Please refresh the page." });
    } else {
      res.json({
        msg: "All products fetched.",
        products,
      });
    }
  } catch (error) {
    res.status(400).json({
      msg: "Failed to fetch all products. Please refresh the page.",
    });
  }
});

// @route       POST /api/administrator/products
// @desc        Add a new product
// @access      Private
router.post(
  "/",
  [
    auth,
    multerUploads.single("image"),
    check("name", "Please enter a name.").exists(),
    check("quantity", "Please enter a quantity.").exists(),
    check("price", "Please enter a price.").exists(),
    check("description", "Please enter a description.").exists(),
    check("rating", "Please enter a rating.").exists(),
    check("category", "Please enter a category.").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, quantity, price, description, rating, category } = req.body;

    try {
      let productExists = await Product.findOne({ name: name });

      if (productExists) {
        res.status(400).json({ msg: "This product already exists." });
      } else {
        let product = new Product({
          name,
          quantity,
          price,
          description,
          image: req.file.path,
          rating,
          category,
        });

        await product.save();

        res.json({
          msg: "Product has been added.",
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

// @route       GET /api/administrator/products/:productID
// @desc        Get a product
// @access      Private
router.get("/:productID", auth, async (req, res) => {
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

// @route       DELETE /api/administrator/products/:productID
// @desc        Remove a product
// @access      Private
router.delete("/:productID", auth, async (req, res) => {
  const { productID } = req.params;

  try {
    let product = await Product.findOne({ _id: productID });

    if (!product) {
      res.status(400).json({ msg: "No such product found." });
    } else {
      await Product.findOneAndRemove({ productID: productID });

      res.json({
        msg: "Product has been removed.",
      });
    }
  } catch (error) {
    res
      .status(400)
      .json({ msg: "Failed to remove the product. Please try again." });
  }
});

// @route       PATCH /api/administrator/products/edit/:productID
// @desc        Edit product information
// @access      Private
router.patch(
  "/edit/:productID",
  [
    auth,
    multerUploads.single("image"),
    check("name", "Please enter a name.").exists(),
    check("quantity", "Please enter a quantity.").exists(),
    check("price", "Please enter a price.").exists(),
    check("description", "Please enter a description.").exists(),
    check("category", "Please enter a category.").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, quantity, price, description, category } = req.body;

    try {
      let product = await Product.findById(req.params.productID);

      if (!product) {
        res.status(400).json({ msg: "Product not found." });
      } else {
        product = await Product.findByIdAndUpdate(
          req.params.productID,
          {
            $set: {
              name,
              quantity,
              price,
              description,
              image: req.file ? req.file.path : product.image,
              category,
            },
          },
          { new: true }
        );

        res.json(product);
      }
    } catch (error) {
      res
        .status(400)
        .json({ msg: "Failed to update the product. Please try again." });
    }
  }
);

export default router;
