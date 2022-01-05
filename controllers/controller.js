const endpoint = require("../services/endPoints");
const json = require("../services/json");
const userModel = require("../models/user");
const orgsModel = require("../models/orgs");

/*** USER ***/

exports.updateUser = async (req, res) => {
  const user = await endpoint.getUser("jcsalinas20");
  userModel.findOneAndUpdate({ type: "user" }, json.user(user), (err, doc) => {
    if (doc) {
      res.header("Content-Type", "application/json");
      res.send(JSON.stringify({ status: true }, null, 2));
    } else {
      res.header("Content-Type", "application/json");
      res.send(JSON.stringify({ status: "Error 404" }, null, 2));
    }
  });
};

exports.getUser = async (req, res) => {
  userModel.findOne({ type: "user" }, function (err, doc) {
    if (err) {
      res.header("Content-Type", "application/json");
      res.send(JSON.stringify({ status: "Error 404" }, null, 2));
    } else {
      res.header("Content-Type", "application/json");
      res.send(JSON.stringify({ user: doc }, null, 2));
    }
  });
};

/*** ORGANIZATIONS ***/

exports.getOrgs = (req, res) => {
    orgsModel.find({ type: "organization" }, function (err, doc) {
      if (err) {
        res.header("Content-Type", "application/json");
        res.send(JSON.stringify({ status: "Error 404" }, null, 2));
      } else {
        res.header("Content-Type", "application/json");
        res.send(JSON.stringify({ orgs: doc }, null, 2));
      }
    });
  };