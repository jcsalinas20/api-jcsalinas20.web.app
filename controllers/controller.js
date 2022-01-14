const endpoint = require("../services/endPoints");
const json = require("../services/json");
const s = require("../services/services");
const orgsModel = require("../models/orgs");
const statsModel = require("../models/stats");

/*** USER ***/

exports.getUser = async (req, res) => {
  if (!s.auth(req.headers.origin, req.headers.authorization, 1)) {
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify({ status: "Error 503" }, null, 2));
    return;
  }

  const gitStats = await endpoint.getGitStats(req.params.user);
  const user = json.user(gitStats.user);
  res.header("Content-Type", "application/json");
  res.send(JSON.stringify({ user }, null, 2));
  return;
};

/*** ORGANIZATIONS ***/

exports.getOrgs = (req, res) => {
  if (!s.auth(req.headers.origin, req.headers.authorization, 1)) {
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify({ status: "Error 503" }, null, 2));
    return;
  }

  orgsModel.find({ type: "organization", user: req.params.user }, function (err, doc) {
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

exports.getRepos = async (req, res) => {
  if (!s.auth(req.headers.origin, req.headers.authorization, 1)) {
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify({ status: "Error 503" }, null, 2));
    return;
  }

  const allRepos = await endpoint.getRepositories(req.params.user);
  const publicRepos = s.getOnlyPublicRepos(allRepos.user.repositories.nodes);
  const repos = json.repositories(publicRepos);
  res.header("Content-Type", "application/json");
  res.send(JSON.stringify({ repos }, null, 2));
};

/*** USER STATUS ***/

exports.putStats = async (req, res) => {
  if (!s.auth(req.headers.origin, req.headers.authorization, 2)) {
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify({ status: "Error 503" }, null, 2));
    return;
  }

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

exports.getStats = async (req, res) => {
  if (!s.auth(req.headers.origin, req.headers.authorization, 1)) {
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify({ status: "Error 503" }, null, 2));
    return;
  }

  const theme = req.params.theme;
  const year = req.params.year;

  statsModel.findOne({ year: year }, (err, doc) => {
    if (err) {
      res.header("Content-Type", "application/json");
      res.send(JSON.stringify({ status: "Failed" }, null, 2));
      return;
    } else {
      const rank = s.calculate(doc);
      const svg = s.createSvg(theme, doc, year, rank);

      res.header("Content-Type", "application/json");
      res.send(JSON.stringify({ svg }, null, 2));
      return;
    }
  });
};
