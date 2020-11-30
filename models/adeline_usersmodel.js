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

const adeline_userSchema = new mongoose.Schema({
  name: String,
  address: String,
  geometry: GeoSchema,
});

const adeline_usermodels = mongoose.model("trial", adeline_userSchema);

// module.exports = adeline_usermodels;
