const endpoint = require("../services/endPoints");
const json = require("../services/json");
const s = require("../services/services");
const userModel = require("../models/user");
const orgsModel = require("../models/orgs");
const reposModel = require("../models/repos");
const collabsModel = require("../models/collabs");
const statsModel = require("../models/stats");

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
  let cont = 0;

  for await (const repo of repos) {
    cont++;
    reposModel.findOne(
      { type: "repository", id: repo.id },
      async (err, doc) => {
        if (err) {
          reposStatus[repo.full_name] = "Failed";
        } else {
          if (doc) {
            if (repo.updated_at > doc.updated) {
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
            const releases = await endpoint.getReleases(
              repo.owner.login,
              repo.name
            );
            reposModel.create(json.repository(repo, lang, releases));
            reposStatus[repo.full_name] = "Created";
          }
        }
      }
    );
  }
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

exports.createCollab = async (req, res) => {
  const collab = await endpoint.getPublicCollabs(req.body.user, req.body.repo);

  collabsModel.findOne(
    { type: "collaboration", id: collab.id },
    async (err, doc) => {
      if (err) {
        res.header("Content-Type", "application/json");
        res.send(JSON.stringify({ status: "Failed" }, null, 2));
      } else {
        if (doc) {
          console.log(doc);
          if (collab.updated_at > doc.updated) {
            const lang = await endpoint.getLang(
              collab.owner.login,
              collab.name
            );
            const releases = await endpoint.getReleases(
              collab.owner.login,
              collab.name
            );
            const contributors = await endpoint.getContributors(
              collab.owner.login,
              collab.name
            );
            const updated = await collabsModel.updateOne(
              { type: "collaboration", id: collab.id },
              json.collaboration(collab, lang, releases, contributors)
            );
            if (updated.ok) {
              res.header("Content-Type", "application/json");
              res.send(JSON.stringify({ status: "Updated" }, null, 2));
            } else {
              res.header("Content-Type", "application/json");
              res.send(JSON.stringify({ status: "Failed" }, null, 2));
            }
          } else {
            res.header("Content-Type", "application/json");
            res.send(JSON.stringify({ status: "No changes" }, null, 2));
          }
        } else {
          const lang = await endpoint.getLang(collab.owner.login, collab.name);
          const releases = await endpoint.getReleases(
            collab.owner.login,
            collab.name
          );
          const contributors = await endpoint.getContributors(
            collab.owner.login,
            collab.name
          );
          collabsModel.create(
            json.collaboration(collab, lang, releases, contributors)
          );
          res.header("Content-Type", "application/json");
          res.send(JSON.stringify({ status: "Created" }, null, 2));
        }
      }
    }
  );
};

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

exports.countStars = (req, res) => {
  reposModel.find({ type: "repository" }, function (err, docs) {
    if (err) {
      res.header("Content-Type", "application/json");
      res.send(JSON.stringify({ status: "Error 404" }, null, 2));
    } else {
      let totalStars = 0;
      for (const doc of docs) {
        totalStars += parseInt(doc.stars);
      }

      userModel.findOneAndUpdate(
        { type: "user" },
        { stars: totalStars },
        (err, doc) => {
          if (err) {
            res.header("Content-Type", "application/json");
            res.send(JSON.stringify({ status: "Error 404" }, null, 2));
          } else {
            res.header("Content-Type", "application/json");
            res.send(JSON.stringify({ stars: totalStars }, null, 2));
          }
        }
      );
    }
  });
};

exports.countCollab = (req, res) => {
  collabsModel.find({ type: "collaboration" }, function (err, docs) {
    if (err) {
      res.header("Content-Type", "application/json");
      res.send(JSON.stringify({ status: "Error 404" }, null, 2));
    } else {
      userModel.findOneAndUpdate(
        { type: "user" },
        { collaborations: docs.length },
        (err, doc) => {
          if (err) {
            res.header("Content-Type", "application/json");
            res.send(JSON.stringify({ status: "Error 404" }, null, 2));
          } else {
            res.header("Content-Type", "application/json");
            res.send(JSON.stringify({ collaborations: docs.length }, null, 2));
          }
        }
      );
    }
  });
};

exports.countLang = (req, res) => {
  let langsJson = {};
  let langs = [];
  reposModel.find({ type: "repository" }, function (err, docs) {
    if (err) {
      res.header("Content-Type", "application/json");
      res.send(JSON.stringify({ status: "Error 404" }, null, 2));
    } else {
      for (const repo of docs) {
        if (
          repo.languages &&
          repo.name != "wordpress-the-dynamic" &&
          repo.name != "wordpress-mundo-anime"
        ) {
          Object.keys(repo.languages).forEach(function (key) {
            if (!langsJson[key]) {
              langsJson[key] = 0;
            }
            langsJson[key] += repo.languages[key];
          });
        }
      }
      Object.keys(langsJson).forEach(function (key) {
        langs.push({ name: key, lines: langsJson[key] });
      });
      langs.sort(function (a, b) {
        return a.lines - b.lines;
      });
      langs.reverse();
      userModel.findOneAndUpdate(
        { type: "user" },
        { languages: langs },
        (err, doc) => {
          if (err) {
            res.header("Content-Type", "application/json");
            res.send(JSON.stringify({ status: "Error 404" }, null, 2));
          } else {
            res.header("Content-Type", "application/json");
            res.send(JSON.stringify({ languages: langs }, null, 2));
          }
        }
      );
    }
  });
};

/*** USER STATUS ***/

exports.putStats = async (req, res) => {
  const collaborations = await endpoint.getPrivateCollabs("jcsalinas20");
  const stars = await endpoint.getStars("jcsalinas20");
  const issues = await endpoint.getIssues("jcsalinas20");
  let pullRequests = await endpoint.getPullRequests("jcsalinas20");
  const commits = await s.getCommitsFromGithubPage("jcsalinas20");

  let nextRequest = s.hasNextRequest(pullRequests.user.repositories.edges);
  if (nextRequest.first > 0) {
    const pullRequestsWithCursor = await endpoint.getPullRequestsWithCursor(
      "jcsalinas20",
      nextRequest.first,
      nextRequest.cursor
    );
    pullRequests = s.mergePullsRequests(
      pullRequests,
      pullRequestsWithCursor,
      nextRequest
    );
  }

  const starsPerYear = s.getStars(stars.user.repositories.nodes);
  const collaborationsPerYear = s.getCollaborations(
    collaborations.user.repositories.edges
  );
  const issuesPerYear = s.getIssues(issues.user.repositories.edges);
  const pullRequestPerYear = s.getPullRequests(
    pullRequests.user.repositories.edges
  );

  const stats = json.stats(
    collaborations.user.name,
    starsPerYear,
    commits,
    pullRequestPerYear,
    issuesPerYear,
    collaborationsPerYear
  );

  for (const year in stats) {
    if (Object.hasOwnProperty.call(stats, year)) {
      statsModel.updateOne(
        { year: year },
        stats[year],
        { upsert: true },
        (err, doc) => {
          if (err) {
            res.header("Content-Type", "application/json");
            res.send(JSON.stringify({ status: "Failed" }, null, 2));
            return;
          } else {
            res.header("Content-Type", "application/json");
            res.send(JSON.stringify({ status: "Updated" }, null, 2));
            return;
          }
        }
      );
    }
  }
};
