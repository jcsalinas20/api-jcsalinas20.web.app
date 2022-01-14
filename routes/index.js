const express = require("express");
const routes = express.Router();
const control = require("../controllers/controller");

module.exports = () => {
  routes.get("/:user", control.getUser);

  routes.get("/:user/orgs", control.getOrgs);

  routes.get("/:user/repos", control.getRepos);

  routes.get("/stats/put", control.putStats);

  routes.get("/stats/get/:year/:theme", control.getStats);

  routes.get("/count/collabs", control.countCollab);

  routes.get("/count/lang", control.countLang);

  return routes;
};
