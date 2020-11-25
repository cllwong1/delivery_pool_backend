const LocationModel = require("../models/Location");

const controller = {
  locate: (req, res) => {
    LocationModel.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [30.2023, 40.7105],
          },
          distanceField: "dis",
          includeLocs: "loc",
          spherical: true,
          maxDistance: 570000,
        },
      },
    ])
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.send(err);
      });
  },
};

module.exports = controller;
