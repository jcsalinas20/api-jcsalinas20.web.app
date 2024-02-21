const endpoint = require("../services/endPoints");
const json = require("../services/json");
const s = require("../services/services");
const orgsModel = require("../models/orgs");
const moment = require("moment");

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

  orgsModel.find(
    { type: "organization", user: req.params.user },
    function (err, doc) {
      if (err) {
        res.header("Content-Type", "application/json");
        res.send(JSON.stringify({ status: "Error 404" }, null, 2));
      } else {
        res.header("Content-Type", "application/json");
        res.send(JSON.stringify({ orgs: doc }, null, 2));
      }
    }
  );
};

/*** REPOSITORIES ***/

exports.getRepos = async (req, res) => {
  if (!s.auth(req.headers.origin, req.headers.authorization, 1)) {
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify({ status: "Error 503" }, null, 2));
    return;
  }

  const allRepos = await endpoint.getRepositories(req.params.user, false);
  const publicRepos = s.getOnlyPublicRepos(allRepos.user.repositories.nodes);
  const repos = json.repositories(publicRepos, false);
  res.header("Content-Type", "application/json");
  res.send(JSON.stringify({ repos }, null, 2));
};


exports.getReposBasic = async (req, res) => {
  console.log(req.headers);
  console.log(req.headers.origin);
  if (!s.auth(req.headers.origin, req.headers.authorization, 1)) {
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify({ status: "Error 503" }, null, 2));
    return;
  }

  const user = req.params.user;
  const type = (req.params.type === "basic") ? true : false ;

  const allRepos = await endpoint.getRepositories(user, type);
  const publicRepos = s.getOnlyPublicRepos(allRepos.user.repositories.nodes);
  const repos = json.repositories(publicRepos, type);
  res.header("Content-Type", "application/json");
  res.send(JSON.stringify({ repos }, null, 2));
};

/*** USER STATUS ***/

exports.getStats = async (req, res) => {
  if (!s.auth(req.headers.origin, req.headers.authorization, 1)) {
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify({ status: "Error 503" }, null, 2));
    return;
  }

  const theme = (req.params.theme) ? req.params.theme : null;
  const user = req.params.user;

  const collaborations = await endpoint.getPrivateCollabs(user);
  const stars = await endpoint.getStars(user);
  const issues = await endpoint.getIssues(user);
  let pullRequests = await endpoint.getPullRequests(user);
  const commits = await s.getCommitsFromGithubPage(user);

  let nextRequest = s.hasNextRequest(pullRequests.user.repositories.edges);
  if (nextRequest.first > 0) {
    const pullRequestsWithCursor = await endpoint.getPullRequestsWithCursor(
      user,
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

  let svg = {};
  const startYear = 2020;
  const endYear = moment().year();
  for(var year = startYear; year <= endYear; year++) {
    svg[year] = "";
  }

  for (const key in stats) {
    if (Object.hasOwnProperty.call(stats, key)) {
      const rank = s.calculate(stats[key]);
      svg[key] = s.createSvg(theme, stats[key], key, rank);;
    }
  }

  res.header("Content-Type", "application/json");
  res.send(JSON.stringify({ svg }, null, 2));
  return;
};
