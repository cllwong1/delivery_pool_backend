const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

const LocationModel = mongoose.model("Location", locationSchema);

module.exports = LocationModel;
