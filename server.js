import express, { json } from "express";
import connectDB from "./database/db.js";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
import user from "./routes/user/user.js";
import auth from "./routes/products/product.js";
import products from "./routes/products/product.js";
import orders from "./routes/orders/orders.js";

const app = express();
app.use(express.json());

// Connect to database
connectDB();

// Enable CORS
app.use(
  cors({
    origin: "*",
    methods: "GET,PATCH,POST,DELETE",
    preflightContinue: true,
    optionsSuccessStatus: 204,
  })
);

// Initialize middleware
app.use(json({ extended: false }));

// Define Routes

app.use("/api/users", user);
app.use("/api/auth", auth);
app.use("/api/products", products);
app.use("/api/orders", orders);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}.`);
});

console.log(listEndpoints(app));
