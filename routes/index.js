const express = require("express");
const routes = express.Router();
const control = require("../controllers/controller");

module.exports = () => {
  routes.get("/:user", control.getUser);

  routes.get("/:user/orgs", control.getOrgs);

  routes.get("/:user/repos", control.getRepos);

  routes.get("/:user/stats/:theme", control.getStats);

  return routes;
};
