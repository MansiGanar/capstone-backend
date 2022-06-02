import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { check, validationResult } from "express-validator";
import Administrator from "../../models/Administrator.js";

const router = express.Router();
const { sign } = jwt;

// @route       POST /api/administrator/register
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
      let adminExists = await Administrator.findOne({ email: email });

      if (adminExists) {
        res.status(400).json({ msg: "Administrator already exists." });
      } else {
        let administrator = new Administrator({
          firstName: firstName,
          lastName: lastName,
          email: email,
          password: password,
        });

        const salt = await bcrypt.genSalt(10);

        administrator.password = await bcrypt.hash(password, salt);

        await administrator.save();

        const payload = {
          administrator: {
            id: administrator.id,
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
      res.status(400).json({
        msg: "Failed to create a new administrator account. Please try again.",
      });
    }
  }
);

// @route       POST /api/administrator/login
// @desc        Auth administrator and get token (login administrator)
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
      let administrator = await Administrator.findOne({ email: email });

      if (administrator) {
        let isMatch = await compare(password, administrator.password);

        if (!isMatch) {
          res.status(400).json({ msg: "Invalid credentials." });
        }

        const payload = {
          administrator: {
            id: administrator.id,
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
