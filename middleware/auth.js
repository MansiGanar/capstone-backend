import jwt from "jsonwebtoken";

const { verify } = jwt;

export default function (req, res, next) {
  const token = req.header("auth-token");

  if (!token) {
    res.status(400).json({ msg: "No token found. Access denied." });
  } else {
    try {
      const decoded = verify(token, process.env.JWT_SECRET);

      req.user = decoded.user || decoded.administrator;
      next();
    } catch (error) {
      res
        .status(400)
        .json({ msg: "Authentication failed. Please login and try again." });
    }
  }
}
