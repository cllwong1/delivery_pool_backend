const UserLocationModel = require("../models/userLocation");
const nodeGeocoder = require("node-geocoder");

let options = {
  provider: "openstreetmap",
};

let geoCoder = nodeGeocoder(options);

const controller = {
  createNewUser: (req, res) => {
    geoCoder
      .geocode("600301")
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        console.log(err);
      });
  },
};

module.exports = controller;
