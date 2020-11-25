const mongoose = require("mongoose");

const GeoSchema = new mongoose.Schema({
  type: {
    type: String,
    default: "Point",
  },
  coordinates: {
    type: [Number],
    index: "2dsphere",
  },
});

const userLocationSchema = new mongoose.Schema({
  name: String,
  geometry: GeoSchema,
});

const UserLocationModel = mongoose.model("userLocation", userLocationSchema);

module.exports = UserLocationModel;
