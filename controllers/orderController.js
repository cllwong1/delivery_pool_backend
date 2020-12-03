const orderModel = require("../models/orders");
const userModel = require("../models/users");
const axios = require("axios");
const jwt = require("jsonwebtoken");

const orderController = {
  createOrder: (req, res) => {
    const orderbody = req.body;

    if (
      !orderbody.restaurant ||
      !orderbody.estDeliveryTime ||
      !orderbody.estDeliveryFee ||
      !orderbody.meetupPoint ||
      !orderbody.order
    ) {
      res.json({
        error: "field must not be empty",
      });
      return;
    }

    if (!Number.isInteger(parseInt(req.body.estDeliveryTime))) {
      res.json({
        error: "numeric field should be numeric",
      });
      return;
    }

    const authToken = req.headers.auth_token;
    const rawJWT = jwt.decode(authToken);
    const email = rawJWT.email;

    userModel
      .findOne({
        email: email,
      })
      .then((response) => {
        if (!response) {
          res.json({ message: "no such user in database" });
          return;
        }
        const meetupPoint = req.body.meetupPoint;
        const encodedadress = encodeURIComponent(meetupPoint);
        axios
          .get(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedadress}&key=${process.env.GEOCODEAPI}`
          )
          .then((georesponse) => {
            orderModel
              .create({
                userid: response.user_id,
                contact: response.contact_number,
                restaurant: req.body.restaurant,
                deliveryTimeEst: req.body.estDeliveryTime,
                deliveryFee: req.body.estDeliveryFee,
                meetupPoint: meetupPoint,
                location: {
                  type: "Point",
                  coordinates: [
                    georesponse.data.results[0].geometry.location.lng,
                    georesponse.data.results[0].geometry.location.lat,
                  ],
                },
                usersjoined: [response.user_id],
                orderDetails: [
                  {
                    orderUserId: response.user_id,
                    food: [req.body.order],
                  },
                ],
              })
              .then((orderResponse) => {
                res.json({
                  message: "successfully capture order",
                });
              })
              .catch((err) => {
                console.log(err);
              });
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  },
  getOrderDetails: (req, res) => {
    orderModel
      .findOne({
        _id: req.params.id,
      })
      .then((result) => {
        if (!result) {
          res.statusCode = 404;
          res.json();
          return;
        }
        res.json(result);
      })
      .catch((err) => {
        console.log(err);
      });
  },
  getOrderCreated: (req, res) => {
    const authToken = req.headers.auth_token;
    const rawJWT = jwt.decode(authToken);

    orderModel
      .find({
        userid: rawJWT.user_id,
      })
      .then((resutls) => {
        res.send(resutls);
      })
      .catch((err) => {
        console.log(err);
      });
  },
  getOrderJoined: (req, res) => {
    const authToken = req.headers.auth_token;
    const rawJWT = jwt.decode(authToken);
    orderModel
      .find({
        usersjoined: {
          $in: [rawJWT.user_id],
        },
      })
      .then((results) => {
        res.send(results);
      })
      .catch((err) => {
        console.log;
      });
  },
};

module.exports = orderController;
