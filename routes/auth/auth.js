import { Router } from "express";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import auth from "../../middleware/auth";
import { check, validationResult } from "express-validator";
import User from "../../models/User.js";

const router = Router.express();

// @route       GET /api/auth
// @desc        Get logged in user
// @access      Private
router.get("/", auth, async (req, res) => {
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

// @route       POST /api/auth
// @desc        Auth user and get token (login user)
// @access      Public
router.post(
  "/",
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
        let isMatch = await compare(password, user.password);

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
