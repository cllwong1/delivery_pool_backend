require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

const locationController = require("./controllers/locationController");
const usersController = require("./controllers/userController");
const orderController = require("./controllers/orderController");

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

//Locate
app.post("/api/v1/location", locationController.locate);

//Users
app.post("/api/v1/users/register", usersController.register);
app.post("/api/v1/users/login", usersController.login);

//Orders
app.get("/api/v1/orders-location", locationController.getOrdersLocation);
app.post("/api/v1/orders-location", locationController.changeLocation);
app.get("/api/v1/orders/:id", orderController.getOrderDetails);
app.get("/api/v1/orders-created", orderController.getOrderCreated);
app.get("/api/v1/orders-joined", orderController.getOrderJoined);

app.post(
  "/api/v1/users/neworder/create",
  verifyJWT,
  orderController.createOrder
);

//amend a particular order
app.post(
  "/api/v1/users/orderscreated/:_id",
  verifyJWT,
  orderController.amendCreatedOrder
);

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

function verifyJWT(req, res, next) {
  // get the jwt token from the request header
  const authToken = req.headers.auth_token;

  // check if authToken header value is empty, return err if empty
  if (!authToken) {
    res.json({
      success: false,
      message: "Auth header value is missing",
    });
    return;
  }

  // verify that JWT is valid and not expired
  try {
    // if verify success, proceed
    const userData = jwt.verify(authToken, process.env.JWT_SECRET, {
      algorithms: ["HS384"],
    });
    next();
  } catch (err) {
    // if fail, return error msg
    res.json({
      success: false,
      message: "Auth token is invalid",
    });
    return;
  }
}
