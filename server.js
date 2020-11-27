require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

const locationController = require("./controllers/LocationController");
const userLocationController = require("./controllers/UserLocationController");
const adeline_userController = require("./controllers/adeline_usercontroller");

const mongoURI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}`;
mongoose.set("useFindAndModify", false);

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(
  cors({
    origin: "*",
  })
);

app.options("*", cors());

app.get("/", locationController.locate);
app.post("/api/v1", userLocationController.createNewUser);
app.post("/api/v1/users/new", adeline_userController.new);
app.get("/api/v1/location", adeline_userController.locate);

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((response) => {
    // DB connected successfully
    console.log("DB connection successful");

    app.listen(port, () => {
      console.log(`Delivery pool app listening on port: ${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
