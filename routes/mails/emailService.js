/*jshint esversion: 6 */
import express from "express";
import nodemailer from "nodemailer";
import { check, validationResult } from "express-validator";
import crypto from "crypto";
import bcrypt from "bcryptjs";

import {
  newsletterSignupEmailTemplate,
  passwordResetEmailTemplate,
} from "./template.js";
import Administrator from "../../models/Administrator.js";
import User from "../../models/User.js";

const router = express.Router();

// @route       POST /api/emails/newsletter-signup
// @desc        Send an email when a new user subscribes to the newsletter
// @access      Public
router.post(
  "/newsletter-signup",
  [check("emailId", "Please enter a valid email address.").isEmail()],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { emailId } = req.body;

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    let mailOptions = {
      from: "comfydecoreurope@gmail.com",
      to: emailId,
      subject: `Welcome to Comfy Decor!`,
      html: newsletterSignupEmailTemplate,
    };

    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        res.json(err);
      } else {
        res.json(info);
      }
    });
  }
);

// @route       POST /api/emails/reset-password/admin
// @desc        Send reset password email for admin
// @access      Public
router.post(
  "/reset-password/admin",
  [check("emailId", "Please enter a valid email address.").isEmail()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { emailId } = req.body;

    try {
      let baseURL =
        process.env.PORT !== "8000"
          ? "https://e-commerce-admin.netlify.app/reset-password/"
          : "http://localhost:3001/reset-password/";

      let user = await Administrator.findOne({ email: emailId });

      if (!user) {
        res.status(400).json({ msg: "Admin not found." });
      } else {
        const token = crypto.randomBytes(20).toString("hex");

        user = await Administrator.findOneAndUpdate(
          { email: emailId },
          {
            $set: {
              resetPasswordToken: token,
              resetPasswordExpires: Date.now() + 3600000,
            },
          }
        );

        let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS,
          },
        });

        let mailOptions = {
          from: "comfydecoreurope@gmail.com",
          to: emailId,
          subject: `Please reset your account's password`,
          html: passwordResetEmailTemplate(baseURL + token),
        };

        transporter.sendMail(mailOptions, function (err, info) {
          if (err) {
            res.json(err);
          } else {
            res.json(info);
          }
        });
      }
    } catch (error) {
      res.json(error);
    }
  }
);

// @route       PATCH /api/emails/update-password/admin/:token
// @desc        Update password
// @access      Public
router.patch("/update-password/admin/:token", async (req, res) => {
  let { password } = req.body;

  try {
    let user = await Administrator.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    const salt = await bcrypt.genSalt(10);

    password = await bcrypt.hash(password, salt);

    if (!user) {
      res.status(400).json({
        msg: "Administrator not found. Please get another link and try again.",
      });
    } else {
      user = await Administrator.findOneAndUpdate(
        { resetPasswordToken: req.params.token },
        { $set: { password: password, resetPasswordToken: null } },
        { new: true }
      );

      res.json({
        msg: "Password changed successfully.",
      });
    }
  } catch (error) {
    res.status(400).json({
      msg: "Failed to update the password. Please get another link and try again.",
    });
  }
});

// @route       POST /api/emails/reset-password/user
// @desc        Send reset password email for user
// @access      Public
router.post(
  "/reset-password/user",
  [check("emailId", "Please enter a valid email address.").isEmail()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { emailId } = req.body;

    try {
      let baseURL =
        process.env.PORT !== "8000"
          ? "https://e-commerce-furniture-store.netlify.app/reset-password/"
          : "http://localhost:3001/reset-password/";

      let user = await User.findOne({ email: emailId });

      if (!user) {
        res.status(400).json({ msg: "User not found." });
      } else {
        const token = crypto.randomBytes(20).toString("hex");

        user = await User.findOneAndUpdate(
          { email: emailId },
          {
            $set: {
              resetPasswordToken: token,
              resetPasswordExpires: Date.now() + 3600000,
            },
          }
        );

        let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS,
          },
        });

        let mailOptions = {
          from: "comfydecoreurope@gmail.com",
          to: emailId,
          subject: `Please reset your account's password`,
          html: passwordResetEmailTemplate(baseURL + token),
        };

        transporter.sendMail(mailOptions, function (err, info) {
          if (err) {
            res.json(err);
          } else {
            res.json(info);
          }
        });
      }
    } catch (error) {
      res.json(error);
    }
  }
);

// @route       PATCH /api/emails/update-password/user/:token
// @desc        Update password
// @access      Public
router.patch("/update-password/user/:token", async (req, res) => {
  let { password } = req.body;

  try {
    let user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    const salt = await bcrypt.genSalt(10);

    password = await bcrypt.hash(password, salt);

    if (!user) {
      res.status(400).json({
        msg: "User not found. Please get another link and try again.",
      });
    } else {
      user = await User.findOneAndUpdate(
        { resetPasswordToken: req.params.token },
        { $set: { password: password, resetPasswordToken: null } },
        { new: true }
      );

      res.json({
        msg: "Password changed successfully.",
      });
    }
  } catch (error) {
    res.status(400).json({
      msg: "Failed to update the password. Please get another link and try again.",
    });
  }
});

export default router;
