require("dotenv").config();
const axios = require("axios");
const jwt = require("jsonwebtoken");

const OrderModels = require("../models/orders");

const controller = {
  locate: (req, res) => {
    const encodedAddress = encodeURIComponent(req.body.address);
    axios
      .get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${process.env.GEOCODEAPI}`
      )
      .then((response) => {
        OrderModels.aggregate([
          {
            $geoNear: {
              near: {
                type: "Point",
                coordinates: [
                  response.data.results[0].geometry.location.lng,
                  response.data.results[0].geometry.location.lat,
                ],
              },
              distanceField: "dis",
              includeLocs: "loc",
              spherical: true,
              maxDistance: 500,
            },
          },
        ])
          .then((updatedResult) => {
            res.json(updatedResult);
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  },
  getOrdersLocation: (req, res) => {
    const authToken = req.headers.auth_token;
    const rawJWT = jwt.decode(authToken);
    const encodedAddress = encodeURIComponent(rawJWT.default_address);
    axios
      .get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${process.env.GEOCODEAPI}`
      )
      .then((response) => {
        OrderModels.aggregate([
          {
            $geoNear: {
              near: {
                type: "Point",
                coordinates: [
                  response.data.results[0].geometry.location.lng,
                  response.data.results[0].geometry.location.lat,
                ],
              },
              distanceField: "dis",
              includeLocs: "loc",
              spherical: true,
              maxDistance: 500,
            },
          },
          {
            $match: {
              userid: {
                $ne: rawJWT.user_id,
              },
            },
          },
        ])
          .then((updatedResult) => {
            res.json(updatedResult);
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  },
  changeLocation: (req, res) => {
    const authToken = req.headers.auth_token;
    const rawJWT = jwt.decode(authToken);
    const encodedAddress = encodeURIComponent(req.body.address);
    axios
      .get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${process.env.GEOCODEAPI}`
      )
      .then((response) => {
        OrderModels.aggregate([
          {
            $geoNear: {
              near: {
                type: "Point",
                coordinates: [
                  response.data.results[0].geometry.location.lng,
                  response.data.results[0].geometry.location.lat,
                ],
              },
              distanceField: "dis",
              includeLocs: "loc",
              spherical: true,
              maxDistance: 500,
            },
          },
          {
            $match: {
              userid: {
                $ne: rawJWT.user_id,
              },
            },
          },
        ])
          .then((updatedResult) => {
            res.json(updatedResult);
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  },
};

module.exports = controller;
