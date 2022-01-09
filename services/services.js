const cheerio = require("cheerio");
const axios = require("axios");

const self = (module.exports = {
  years: () => {
    return { 2022: 0, 2021: 0, 2020: 0 };
  },

  getCommitsFromGithubPage: async (username) => {
    const years = ["2020", "2021"];
    let countCommits = self.years();
    for (const year of years) {
      const data = await axios(
        `https://github.com/${username}?tab=overview&from=${year}-12-01&to=${year}-12-31`
      );
      const $ = cheerio.load(await data.data);

      const totalMatch = $(".js-yearly-contributions h2")
        .text()
        .trim()
        .match(/^([0-9,]+)\s/);

      if (!totalMatch) {
        throw Error("Unable to fetch total contributions count.");
      }

      countCommits[year] = parseInt(totalMatch[0].replace(/,/g, ""), 10);
    }
    return countCommits;
  },

  hasNextRequest: (pulls) => {
    let nextRequest = {};
    for (let index = 0; index < pulls.length; index++) {
      const item = pulls[index];
      if (item.repository.pullRequests.totalCount > 100) {
        nextRequest.name = item.repository.name;
        nextRequest.first = item.repository.pullRequests.totalCount - 100;
        nextRequest.cursor = item.repository.pullRequests.edges.pop().cursor;
        nextRequest.index = index;
      }
    }
    return nextRequest;
  },

  mergePullsRequests: (pullRequests, pullRequestsWithCursor, nextRequest) => {
    for (const item of pullRequestsWithCursor.user.repositories.edges) {
      if (item.repository.name == nextRequest.name) {
        for (const pull of item.repository.pullRequests.edges) {
          pullRequests.user.repositories.edges[
            nextRequest.index
          ].repository.pullRequests.edges.push(pull);
        }
        break;
      }
    }
    return pullRequests;
  },

  getStars: (repos) => {
    let countCollaborations = self.years();
    for (const repo of repos) {
      if (repo.stargazers.totalCount > 0) {
        for (const star of repo.stargazers.nodes) {
          const year = star.createdAt.slice(0, 4);
          if (year === "2019") {
            countCollaborations["2020"]++;
          } else {
            countCollaborations[year]++;
          }
        }
      } else {
        break;
      }
    }
    return countCollaborations;
  },

  getCollaborations: (repos) => {
    let countCollaborations = self.years();
    for (const repo of repos) {
      const year = repo.repository.createdAt.slice(0, 4);
      if (year === "2019") {
        countCollaborations["2020"]++;
      } else {
        countCollaborations[year]++;
      }
    }
    return countCollaborations;
  },

  getIssues: (repos) => {
    let countIssues = self.years();
    for (const repo of repos) {
      for (const issue of repo.repository.issues.edges) {
        if (issue.node.assignees.nodes.length > 0) {
          for (const user of issue.node.assignees.nodes) {
            if (user.login === "jcsalinas20") {
              const year = issue.node.createdAt.slice(0, 4);
              if (year === "2019") {
                countIssues["2020"]++;
              } else {
                countIssues[year]++;
              }
            }
          }
        } else {
          if (!issue.node.author || issue.node.author.login === "jcsalinas20") {
            const year = issue.node.createdAt.slice(0, 4);
            if (year === "2019") {
              countIssues["2020"]++;
            } else {
              countIssues[year]++;
            }
          }
        }
      }
    }
    return countIssues;
  },

  getPullRequests: (repos) => {
    let countPullRequests = self.years();
    for (const repo of repos) {
      for (const pull of repo.repository.pullRequests.edges) {
        if (
          !pull.pullRequest.author ||
          pull.pullRequest.author.login === "jcsalinas20" ||
          pull.pullRequest.author.login === "imgbot"
        ) {
          const year = pull.pullRequest.createdAt.slice(0, 4);
          if (year === "2019") {
            countPullRequests["2020"]++;
          } else {
            countPullRequests[year]++;
          }
        }
      }
    }
    return countPullRequests;
  },
});
