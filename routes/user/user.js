import express from "express";
import User from "../../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import auth from "../../middleware/auth.js";
import { check, validationResult } from "express-validator";

const router = express.Router();
const { sign } = jwt;

// @route       POST /api/users/register
// @desc        Register a user
// @access      Public
router.post(
  "/register",
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
            expiresIn: "1h",
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
    }
  }
);

// @route       PATCH /api/users/edit/:userID
// @desc        Edit personal information
// @access      Private
router.patch(
  "/edit/:userID",
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
      let user = await User.findById(req.params.userID);

      if (!user) {
        res.status(400).json({ msg: "User not found." });
      } else {
        user = await User.findByIdAndUpdate(
          req.params.userID,
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

// @route       GET /api/users/profile
// @desc        Get logged in user
// @access      Private
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (user) {
      res.json(user);
    } else {
      res
        .status(400)
        .json({ msg: "Failed to load profile. Please try again." });
    }
  } catch (error) {
    res.status(400).json({ msg: "Failed to load profile. Please try again." });
  }
});

// @route       POST /api/users/login
// @desc        Auth user and get token (login user)
// @access      Public
router.post(
  "/login",
  [
    check("email", "Please enter a valid email.").isEmail(),
    check("password", "Please enter a password.").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email: email });

      if (user) {
        let isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          res.status(400).json({ msg: "Invalid credentials." });
        }

        const payload = {
          user: {
            id: user.id,
          },
        };

        sign(
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
      } else {
        res.status(400).json({ msg: "Invalid credentials." });
      }
    } catch (error) {
      res.status(400).json({ msg: "Failed to login. Please try again." });
    }
  }
);

export default router;
