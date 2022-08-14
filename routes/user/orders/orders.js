import express from "express";
import auth from "../../../middleware/auth.js";
import { check, validationResult } from "express-validator";
import moment from "moment";
import Order from "../../../models/Order.js";

const router = express.Router();

// @route       GET /api/users/orders/all
// @desc        Get all orders
// @access      Private
router.get("/all", auth, async (req, res) => {
  try {
    let orders = await Order.find({ userId: req.user.id });

    if (!orders) {
      res.status(400).json({ msg: "You haven't placed any orders yet." });
    } else {
      res.json(orders);
    }
  } catch (error) {
    res.status(400).json({
      msg: "Failed to fetch all the orders. Please refresh the page.",
    });
  }
});

// @route       POST /api/users/orders
// @desc        Place an order
// @access      Private
router.post(
  "/",
  [
    auth,
    check("firstName", "Please enter your first name.").notEmpty(),
    check("lastName", "Please enter your last name.").notEmpty(),
    check("email", "Please enter a valid email address.").isEmail(),
    check("totalCost", "Please enter totalCost.").notEmpty(),
    check("streetName", "Please enter street address.").notEmpty(),
    check("city", "Please enter city.").notEmpty(),
    check("country", "Please enter country.").notEmpty(),
    check("postalCode", "Please enter postal code.").notEmpty(),
    check("deliveryMethod", "Please enter delivery method.").notEmpty(),
    check("orderItems", "Please enter orderItems.").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      firstName,
      lastName,
      totalCost,
      email,
      streetName,
      city,
      country,
      postalCode,
      orderItems,
      deliveryMethod,
    } = req.body;

    let now = `${moment().date()}/${moment().month() + 1}/${moment().year()}`;

    try {
      let order = new Order({
        firstName,
        lastName,
        totalCost,
        email,
        streetName,
        city,
        country,
        postalCode,
        orderItems,
        date: now,
        status: "In progress",
        userId: req.user.id,
        deliveryMethod,
      });

      await order.save();

      res.json({
        msg: "Your order has been placed.",
        order,
      });
    } catch (error) {
      res.status(400).json({
        msg: "Failed to place your order. Please try again.",
      });
    }
  }
);

// @route       GET /api/users/orders/:orderID
// @desc        Get an order
// @access      Private
router.get("/:orderID", [auth], async (req, res) => {
  const { orderID } = req.params;

  try {
    let order = await Order.findOne({ _id: orderID });

    if (!order) {
      res.status(400).json({ msg: "No such order found." });
    } else {
      res.json(order);
    }
  } catch (error) {
    res.status(400).json({
      msg: "Failed to fetch the order. Please try again.",
    });
  }
});

// @route       PATCH /api/users/orders/:orderID
// @desc        Cancel an order
// @access      Private
router.patch("/:orderID", [auth], async (req, res) => {
  const { orderID } = req.params;

  try {
    let order = await Order.findOne({ _id: orderID });

    if (!order) {
      res.status(400).json({ msg: "Order not found." });
    } else {
      order = await Order.findOneAndUpdate(
        { _id: orderID },
        { $set: { status: "Cancelled" } },
        { new: true }
      );

      res.json({ msg: "The order has been cancelled." });
    }
  } catch (error) {
    res
      .status(400)
      .json({ msg: "Failed to cancel the order. Please try again." });
  }
});

export default router;
