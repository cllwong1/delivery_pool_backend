const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  name: String,
  address: {
    street: String,
    city: String,
    state: String,
    postCode: Number,
    country: String,
    loc: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: [Number],
    },
  },
});

locationSchema.index({ loc: "2dsphere" });

const LocationModel = mongoose.model("Location", locationSchema);

module.exports = LocationModel;
