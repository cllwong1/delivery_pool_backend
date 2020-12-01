const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userid: {
    type: String,
  },
  slug: {
    type: String,
  },
  contact: {
    type: Number,
  },
  restaurant: {
    type: String,
    required: true,
  },
  deliveryTimeEst: {
    type: String,
    required: true,
  },
  deliveryFee: {
    type: Number,
    required: true,
  },
  meetupPoint: {
    type: String,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
    },
    coordinates: [Number],
  },
  distance: {
    type: Number,
  },
  usersjoined: [String],
  orderDetails: [
    {
      orderUserId: String,
      food: [String],
    },
  ],
});

orderSchema.index({ location: "2dsphere" });

const orderModel = mongoose.model("Neworder", orderSchema);

module.exports = orderModel;
