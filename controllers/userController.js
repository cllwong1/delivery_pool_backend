require("dotenv").config();
const axios = require("axios");
const jwt = require("jsonwebtoken");
const SHA256 = require("crypto-js/sha256");
const uuid = require("uuid");
const UserModel = require("../models/users");
const _ = require("lodash");

const controllers = {
  register: (req, res) => {
    UserModel.findOne({
      email: req.body.email,
    })
      .then((result) => {
        if (result) {
          res.statusCode = 400;
          res.json({
            success: false,
            message: "Username already exists",
          });
          return;
        }

        const encodedAddress = encodeURIComponent(req.body.default_address);
        axios
          .get(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${process.env.GEOCODEAPI}`
          )
          .then((response) => {
            const salt = uuid.v4();
            const combination = salt + req.body.password;
            const hash = SHA256(combination).toString();

            UserModel.create({
              first_name: req.body.first_name,
              last_name: req.body.last_name,
              email: req.body.email,
              contact_number: req.body.contact_number,
              user_id: req.body.user_id,
              slug: _.kebabCase(req.body.first_name + req.body.last_name),
              default_address: req.body.default_address,
              "geometry.coordinates": [
                response.data.results[0].geometry.location.lng,
                response.data.results[0].geometry.location.lat,
              ],
              pwsalt: salt,
              hash: hash,
            })
              .then((createResult) => {
                res.json({
                  success: true,
                  message: "New User is Registered",
                });
              })
              .catch((err) => {
                console.log(err);
                res.statusCode = 500;
                res.json({
                  success: false,
                  message: "unable to register due to unexpected error",
                });
              });
          })
          .catch((err) => {
            console.log(err);
            res.statusCode = 500;
            res.json({
              success: false,
              message: "unable to register due to unexpected error",
            });
          });
      })
      .catch((err) => {
        console.log(err);
        res.statusCode = 500;
        res.json({
          success: false,
          message: "unable to register due to unexpected error",
        });
      });
  },

  login: (req, res) => {
    UserModel.findOne({
      email: req.body.email,
    })
      .then((result) => {
        // check if result is empty, if it is, no user, so login fail, return err as json response
        if (!result) {
          res.statusCode = 401;
          res.json({
            success: false,
            message: "Either username or password is wrong",
          });
          return;
        }

        // combine DB user salt with given password, and apply hash algo
        const hash = SHA256(result.pwsalt + req.body.password).toString();

        // check if password is correct by comparing hashes
        if (hash !== result.hash) {
          res.statusCode = 401;
          res.json({
            success: false,
            message: "Either username or password is wrong",
          });
          return;
        }

        // login successful, generate JWT
        const token = jwt.sign(
          {
            first_name: result.first_name,
            last_name: result.last_name,
            email: result.email,
          },
          process.env.JWT_SECRET,
          {
            algorithm: "HS384",
            expiresIn: "1h",
          }
        );

        // decode JWT to get raw values
        const rawJWT = jwt.decode(token);

        // return token as json response
        res.json({
          success: true,
          token: token,
          expiresAt: rawJWT.exp,
        });
      })
      .catch((err) => {
        res.statusCode = 500;
        res.json({
          success: false,
          message: "unable to login due to unexpected error",
        });
      });
  },
};

module.exports = controllers;
