import "dotenv/config";
import express, { json } from "express";
import connectDB from "./database/db.js";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
import user from "./routes/user/user.js";
import ordersUser from "./routes/user/orders/orders.js";
import productsAdmin from "./routes/administrator/products/product.js";
import administrator from "./routes/administrator/administrator.js";
import ordersAdmin from "./routes/administrator/orders/orders.js";
import productsUser from "./routes/user/products/products.js";
import emailService from "./routes/mails/emailService.js";

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
    credentials: true,
  })
);

// Initialize middleware
app.use(json({ extended: false }));

// Define Routes

app.use("/api/users", user);
app.use("/api/users/products", productsUser);
app.use("/api/users/orders", ordersUser);

app.use("/api/administrator", administrator);
app.use("/api/administrator/products", productsAdmin);
app.use("/api/administrator/orders", ordersAdmin);

app.use("/api/emails", emailService);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}.`);
});

console.log(listEndpoints(app));
