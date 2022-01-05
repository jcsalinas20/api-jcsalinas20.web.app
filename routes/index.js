const express = require("express");
const routes = express.Router();
const control = require("../controllers/controller");

module.exports = () => {
  routes.get("/user/put", control.updateUser);

  routes.get("/user/get", control.getUser);

  routes.get("/orgs/get", control.getOrgs);

  //   routes.get("/repos/put", control.updateRepos);

  routes.get("/repos/get", control.getRepos);

  //   routes.post("/collabs/post", control.createCollab);

  //   routes.get("/collabs/get", control.getCollabs);

  //   routes.get("/stats/put", control.putStats);

  //   routes.get("/stats/get/:year/:theme", control.getStats);

  //   routes.get("/count/stars", control.countStars);

  //   routes.get("/count/collabs", control.countCollab);

  //   routes.get("/count/lang", control.countLang);

  return routes;
};
