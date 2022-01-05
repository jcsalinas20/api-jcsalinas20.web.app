const endpoint = require("../services/endPoints");
const json = require("../services/json");
const userModel = require("../models/user");
const orgsModel = require("../models/orgs");
const reposModel = require("../models/repos");
const collabsModel = require("../models/collabs");

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

/*** REPOSITORIES ***/

exports.updateRepos = async (req, res) => {
  let reposStatus = {};
  const repos = await endpoint.getRepos("jcsalinas20");

  for await (const repo of repos) {
    const findDoc = reposModel.findOne(
      { type: "repository", id: repo.id },
      (err, doc) => {
        if (err) {
          return -1;
        } else {
          return doc;
        }
      }
    );

    if (findDoc) {
      if (repo.updated_at > findDoc.updated) {
        const lang = await endpoint.getLang(repo.owner.login, repo.name);
        const releases = await endpoint.getReleases(
          repo.owner.login,
          repo.name
        );

        reposStatus[repo.full_name] = "Updated";
        const updated = await reposModel.updateOne(
          { type: "repository", id: repo.id },
          json.repository(repo, lang, releases)
        );

        if (updated.ok) {
          reposStatus[repo.full_name] = "Updated";
        } else {
          reposStatus[repo.full_name] = "Failed";
        }
      } else {
        reposStatus[repo.full_name] = "No changes";
      }
    } else {
      const lang = await endpoint.getLang(repo.owner.login, repo.name);
      const releases = await endpoint.getReleases(repo.owner.login, repo.name);
      reposModel.create(json.repository(repo, lang, releases));
      reposStatus[repo.full_name] = "Created";
    }
  }

  res.header("Content-Type", "application/json");
  res.send(JSON.stringify(reposStatus, null, 2));
};

exports.getRepos = async (req, res) => {
  reposModel.find({ type: "repository" }, function (err, doc) {
    if (err) {
      res.header("Content-Type", "application/json");
      res.send(JSON.stringify({ status: "Error 404" }, null, 2));
    } else {
      res.header("Content-Type", "application/json");
      res.send(JSON.stringify({ repos: doc }, null, 2));
    }
  });
};

/*** COLLABORATIONS ***/

exports.getCollabs = (req, res) => {
  collabsModel.find({ type: "collaboration" }, function (err, doc) {
    if (err) {
      res.header("Content-Type", "application/json");
      res.send(JSON.stringify({ status: "Error" }, null, 2));
      return {};
    } else {
      res.header("Content-Type", "application/json");
      res.send(JSON.stringify({ collabs: doc }, null, 2));
      return {};
    }
  });
};

/*** COUNTS ***/
