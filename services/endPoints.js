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
};
