const { endpoint } = require("@octokit/endpoint");
const axios = require("axios");

module.exports = {
  getUser: async (username) => {
    const req = endpoint("GET /users/{user}", {
      headers: {
        authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
      user: username,
    });
    return await axios(req).then((res) => {
      return res.data;
    });
  },

  getRepos: async (username) => {
    const req = endpoint("GET /users/{user}/repos", {
      headers: {
        authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
      user: username,
    });
    return await axios(req).then((res) => {
      return res.data;
    });
  },
  getLang: async (username, repository) => {
    const req = endpoint("GET /repos/{user}/{repo}/languages", {
      headers: {
        authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
      user: username,
      repo: repository,
    });
    return await axios(req).then((res) => {
      return res.data;
    });
  },

  getReleases: async (username, repository) => {
    const req = endpoint("GET /repos/{user}/{repo}/releases", {
      headers: {
        authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
      user: username,
      repo: repository,
    });
    return json.releases(
      await axios(req).then((res) => {
        return res.data;
      })
    );
  },

  getUser: async (username) => {
    const req = endpoint("GET /users/{user}", {
      headers: {
        authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
      user: username,
    });
    return await axios(req).then((res) => {
      return res.data;
    });
  },

  getPublicCollabs: async (username, repository) => {
    const req = endpoint("GET /repos/{user}/{repo}", {
      headers: {
        authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
      user: username,
      repo: repository,
    });

    return await axios(req).then((res) => {
      return res.data;
    });
  },
};
