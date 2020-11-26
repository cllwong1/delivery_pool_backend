require("dotenv").config();
const axios = require("axios");
const { response } = require("express");
const adeline_usermodels = require("../models/adeline_usersmodel");

const controller = {
  new: (req, res) => {
    const encodedAddress = encodeURIComponent(req.body.address);
    axios
      .get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${process.env.GEOCODEAPI}`
      )
      .then((response) => {
        adeline_usermodels
          .create({
            name: req.body.name,
            address: req.body.address,
            "geometry.coordinates": [
              response.data.results[0].geometry.location.lng,
              response.data.results[0].geometry.location.lat,
            ],
          })
          .then((result) => {
            res.send(result);
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  },
  locate: (req, res) => {
    adeline_usermodels
      .findOne({
        name: "Colin Wong",
      })
      .then((result) => {
        adeline_usermodels
          .aggregate([
            {
              $geoNear: {
                near: {
                  type: "Point",
                  coordinates: [
                    result.geometry.coordinates[0],
                    result.geometry.coordinates[1],
                  ],
                },
                distanceField: "dis",
                includeLocs: "loc",
                spherical: true,
                maxDistance: 500,
              },
            },
          ])
          .then((secondResult) => {
            res.send(secondResult);
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
