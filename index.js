const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const mongoString = process.env.DATABASE_URL;
const routes = require("./routes/routes");

mongoose.connect(mongoString);
const database = mongoose.connection;
database.on("error", (error) => {
  console.log(error);
});

database.once("connected", () => {
  console.log("Database Connected");
});

const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());
app.use("/api", routes);

app.listen(3001, () => {
  console.log(`Server Started at ${3001}`);
});

module.exports = app;
