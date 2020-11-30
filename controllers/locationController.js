require("dotenv").config();
const axios = require("axios");

const OrderModels = require("../models/orders");

const controller = {
  locate: (req, res) => {
    console.log(req.body.address);
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
            res.send(updatedResult);
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
