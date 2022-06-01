import express from "express";
import User from "../../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import auth from "../../middleware/auth.js";
import { check, validationResult } from "express-validator";

const router = express.Router();
const { sign } = jwt;

// @route       POST /api/users
// @desc        Register a user
// @access      Public
router.post(
  "/",
  [
    check("firstName", "Please enter your first name.").notEmpty(),
    check("lastName", "Please enter your last name.").notEmpty(),
    check("email", "Please enter a valid email address.").isEmail(),
    check(
      "password",
      "Please enter a password with at least 8 characters."
    ).isLength({ min: 8 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password } = req.body;

    try {
      let userExists = await User.findOne({ email: email });

      if (userExists) {
        res.status(400).json({ msg: "User already exists." });
      } else {
        let user = new User({
          firstName: firstName,
          lastName: lastName,
          email: email,
          password: password,
        });

        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {
          user: {
            id: user.id,
          },
        };

        jwt.sign(
          payload,
          process.env.JWT_SECRET,
          {
            expiresIn: 60 * 60,
          },
          (err, token) => {
            if (err) {
              throw err;
            } else {
              res.json({ token });
            }
          }
        );
      }
    } catch (error) {
      res
        .status(400)
        .json({ msg: "Failed to create a new account. Please try again." });
      console.log(error);
    }
  }
);

// @route       PATCH /api/users
// @desc        Edit personal information
// @access      Private
router.patch(
  "/",
  [
    auth,
    [
      check("firstName", "Please enter your first name.").notEmpty(),
      check("lastName", "Please enter your last name.").notEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName } = req.body;

    try {
      let user = await User.findById(req.user.id);

      if (!user) {
        res.status(400).json({ msg: "User not found." });
      } else {
        user = await User.findByIdAndUpdate(
          req.user.id,
          { $set: { firstName: firstName, lastName: lastName } },
          { new: true }
        ).select("-password");

        res.json(user);
      }
    } catch (error) {
      res
        .status(400)
        .json({ msg: "Failed to update the profile. Please try again." });
    }
  }
);

export default router;
