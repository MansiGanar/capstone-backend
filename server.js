require("dotenv").config();

const express = require("express");
const connectDB = require("./database/db");
const cors = require("cors");
const listEndpoints = require("express-list-endpoints");

const app = express();

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
app.use(express.json({ extended: false }));

// Define Routes
app.use("/api/users", require("./routes/user/user"));
app.use("/api/auth", require("./routes/auth/auth"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}.`);
});

console.log(listEndpoints(app));
