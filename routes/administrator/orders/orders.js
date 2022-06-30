import express from "express";
import auth from "../../../middleware/auth.js";
import Order from "../../../models/Order.js";

const router = express.Router();

// @route       GET /api/administrator/orders/all
// @desc        Get all orders
// @access      Private
router.get("/all", auth, async (req, res) => {
  try {
    let orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(400).json({
      msg: "Failed to fetch all the orders. Please refresh the page.",
    });
  }
});

// @route       GET /api/administrator/orders/:orderID
// @desc        Get an order
// @access      Private
router.get("/:orderID", auth, async (req, res) => {
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

// @route       PATCH /api/administrator/orders/cancel/:orderID
// @desc        Cancel an order
// @access      Private
router.patch("/cancel/:orderID", [auth], async (req, res) => {
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

// @route       PATCH /api/administrator/orders/complete/:orderID
// @desc        Complete an order
// @access      Private
router.patch("/complete/:orderID", [auth], async (req, res) => {
  const { orderID } = req.params;

  try {
    let order = await Order.findOne({ _id: orderID });

    if (!order) {
      res.status(400).json({ msg: "Order not found." });
    } else {
      order = await Order.findOneAndUpdate(
        { _id: orderID },
        { $set: { status: "Completed" } },
        { new: true }
      );

      res.json({ msg: "The order has been completed." });
    }
  } catch (error) {
    res
      .status(400)
      .json({ msg: "Failed to complete the order. Please try again." });
  }
});

export default router;
