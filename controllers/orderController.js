const orderModel = require("../models/orders");
const userModel = require("../models/users");
const axios = require("axios");
const jwt = require("jsonwebtoken");

const orderController = {

  newOrder(req, res){
    obtainUserInfo(req, res)
    .then(response=>{
      // console.log(response)
      res.json(response)
    }
      
    )
    .catch(err=>{console.log(err)})
  },

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
                // usersjoined: [response.user_id],
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
  amendCreatedOrder(req, res) {
    // console.log(req.body);
    // console.log("connected");
    obtainUserInfo(req, res).then((response) => {
      if (!response) {
        res.json({ message: "user error" });
        return;
      }

      const orderid = req.params._id;

      orderModel
        .findOneAndUpdate(
          { _id: orderid, "orderDetails.orderUserId": response.user_id },
          { $set: { "orderDetails.$.food": [req.body.orderitem] } }
        )
        .then((result) => {
          res.json(result);
          // console.log("working");
        })
        .catch((err) => {
          console.log(err);
        });
    });
  },
  joinOrder(req, res) {
    //retrieve the order id from the params
    // retrive the order item
    const orderid = req.params.id;
    const orderitem = req.body.orderitem;
    //push the user into the userjoined array
    //push the userid and order item into the orderdetails array
    obtainUserInfo(req, res)
      .then((response) => {
        orderModel
          .findOneAndUpdate(
            { _id: orderid },
            {
              $push: {
                usersjoined: response.user_id,
                orderDetails: {
                  orderUserId: response.user_id,
                  food: orderitem,
                },
              },
            }
          )
          .then((result) => {
            res.json({ message: "successfully join order" });
            // console.log("working");
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  },

  getJoinedOrderDetails(req, res) {
    const orderid = req.params.id;

    obtainUserInfo(req, res)
      .then((response) => {
        orderModel
          .findOne(
            { _id: orderid, "orderDetails.orderUserId": response.user_id },
            { "orderDetails.$": 1 }
          )
          .then((result) => {
            // console.log(result)
            res.json(result);
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  },
  amendJoinedOrder(req, res) {
    console.log("connect");
    console.log(req.params.id);
    console.log(req.body.orderitem);
    obtainUserInfo(req, res).then((response) => {
      if (!response) {
        res.json({ message: "user error" });
        return;
      }
      const orderid = req.params.id;
      orderModel
        .findOneAndUpdate(
          { _id: orderid, "orderDetails.orderUserId": response.user_id },
          { $set: { "orderDetails.$.food": [req.body.orderitem] } }
        )
        .then((result) => {
          console.log(result);
          res.json(result);
          console.log("working");
        })
        .catch((err) => {
          console.log(err);
        });
    });
  },
};

function obtainUserInfo(req, res) {
  //decode the jwt to retrieve the user iinfo
  const authToken = req.headers.auth_token;
  const rawJWT = jwt.decode(authToken);
  const email = rawJWT.email;

  //check the user databsase to see if the user exists using the above user info

  return userModel.findOne({
    email: email,
  });
}

module.exports = orderController;
