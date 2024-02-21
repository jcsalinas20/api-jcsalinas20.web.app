const cheerio = require("cheerio");
const axios = require("axios");
const moment = require("moment");

const scores = [
  {
    id: "S_SCORE",
    max: 100,
    min: 98,
    letterSign: "S",
    translation: "Excellent!",
    color: "#eacb2f",
    progress: "0",
  },
  {
    id: "A_PLUS_SCORE",
    max: 97,
    min: 81,
    letterSign: "A+",
    translation: "Very Good!",
    color: "#1eb300",
    progress: "50",
  },
  {
    id: "A_SCORE",
    max: 80,
    min: 41,
    letterSign: "A",
    translation: "Very Good!",
    color: "#2fa0ed",
    progress: "100",
  },
  {
    id: "B_PLUS_SCORE",
    max: 40,
    min: 31,
    letterSign: "B+",
    translation: "Good!",
    color: "#ed962f",
    progress: "120",
  },
  {
    id: "B_SCORE",
    max: 30,
    min: 21,
    letterSign: "B",
    translation: "Good!",
    color: "#7d00b3",
    progress: "140",
  },
  {
    id: "C_SCORE",
    max: 20,
    min: 0,
    letterSign: "C",
    translation: "Average.",
    color: "#b30000",
    progress: "170",
  },
];

const metrics = {
  SIGMA: 450,
  COMMITS: 0.6,
  PULL_REQUESTS: 2,
  ISSUES: 2,
  CODE_REVIEWS: 2,
};

const self = (module.exports = {
  years: (type) => {
    if (type === "jsonAsc") {
      let svg = {};
      const startYear = 2020;
      const endYear = moment().year();
      for(var year = startYear; year <= endYear; year++) {
        svg[year] = "";
      }
    } else if (type === "jsonDesc") {
      let years = {};
      const startYear = moment().year();
      const endYear = 2020;
      for(var year = startYear; year >= endYear; year--) {
        years[year] = 0;
      }
      return years;
    } else if (type === "array") {

    }
  },

  auth: (origin, token, level) => {
    let allowedOrigins = JSON.parse(process.env.ALLOWED_ORIGIN);
    console.log(origin, allowedOrigins);
    if (level === 1) {
      var urlOK = false, jwtOK = false;
      if (allowedOrigins.indexOf(origin) != -1) {
        urlOK = true;
      } 
      if (token === process.env.JWT_API) {
        jwtOK = true;
      }

      if (urlOK && jwtOK) {
        return true;
      }
    }
    return false;
  },

  getOnlyPublicRepos: (repos) => {
    let publicRepos = [];
    for (const repo of repos) {
        if (!repo.isPrivate) {
          publicRepos.push(repo);
        }
    }
    return publicRepos;
  },
  

  getCommitsFromGithubPage: async (username) => {
    const startYear = 2020;
    const endYear = moment().year();

    var years = [];
    for(var year = startYear; year <= endYear; year++) {
      years.push(year);
    }
    
    let countCommits = self.years("jsonDesc");
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
    let countStars = self.years("jsonDesc");
    for (const repo of repos) {
      if (repo.stargazers.totalCount > 0) {
        for (const star of repo.stargazers.nodes) {
          const year = star.createdAt.slice(0, 4);
          if (year === "2019") {
            countStars["2020"]++;
          } else {
            countStars[year]++;
          }
        }
      } else {
        break;
      }
    }
    return countStars;
  },

  getCollaborations: (repos) => {
    let countCollaborations = self.years("jsonDesc");
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
    let countIssues = self.years("jsonDesc");
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
    let countPullRequests = self.years("jsonDesc");
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

  countGitStats: (repos, username) => {
    let counts = {
      stars: {
        total: 0,
        public: 0,
        private: 0,
      },
      collabs: {
        total: 0,
        public: 1,
        private: 0,
      },
      repos: {
        total: 0,
        public: 0,
        private: 0,
      },
      langs: [],
    };
    let jsonLangs = {};
    for (const repo of repos) {
      if (repo.isPrivate) {
        counts.stars.private += repo.stargazerCount;
        if (repo.owner.login === username) {
          counts.repos.private++;
        } else {
          counts.collabs.private++;
        }
      } else {
        counts.stars.public += repo.stargazerCount;
        if (repo.owner.login === username) {
          counts.repos.public++;
        } else {
          counts.collabs.public++;
        }
      }
      for (const lang of repo.languages.edges) {
        if (
          repo.name != "wordpress-the-dynamic" &&
          repo.name != "wordpress-mundo-anime"
        ) {
          if (!jsonLangs[lang.node.name]) {
            jsonLangs[lang.node.name] = {
              color: lang.node.color,
              size: lang.size,
            };
          } else {
            jsonLangs[lang.node.name].size += lang.size;
          }
        }
      }
    }
    Object.keys(jsonLangs).forEach(function (key) {
      counts.langs.push({
        name: key,
        size: jsonLangs[key].size,
        color: jsonLangs[key].color,
      });
    });
    counts.langs.sort(function (a, b) {
      return a.size - b.size;
    });
    counts.langs.reverse();
    counts.stars.total = counts.stars.public + counts.stars.private;
    counts.repos.total = counts.repos.public + counts.repos.private;
    counts.collabs.total = counts.collabs.public + counts.collabs.private;
    return counts;
  },

  /*** SVG STATS ***/

  calculate: (details) => {
    let overallScores = 0;
    const x =
      details.commits +
      details.pullRequests +
      details.issues +
      details.stars +
      details.collaborations;
    const mu = self.mean([
      details.commits,
      details.pullRequests,
      details.issues,
      details.stars,
      details.collaborations,
    ]);
    if (x !== 0) {
      const z = self.zScore(x, mu, metrics.SIGMA);
      overallScores = Math.round(self.standardNormalDistribution(z) * 100);
    }
    return self.processOverallScoresCondition(overallScores);
  },

  mean: (dataSet) => {
    let total = 0;
    dataSet.forEach((x) => {
      total += x;
    });
    return total / dataSet.length;
  },

  processOverallScoresCondition: (overallScores) => {
    let ratings = {};
    const scoresLength = scores.length;
    for (let x = 0; x < scoresLength; x++) {
      if (overallScores <= scores[x].max && overallScores >= scores[x].min) {
        ratings = scores[x];
        break;
      }
    }
    return ratings;
  },

  zScore: (x, mu, sigma) => {
    return (x - mu) / sigma;
  },

  standardNormalDistribution: (z) => {
    let k, m, values, total, item, z2, z4, a, b;

    if (z < -6) {
      return 0;
    }
    if (z > 6) {
      return 1;
    }

    m = 1; // m(k) == (2**k)/factorial(k)
    b = z; // b(k) == z ** (2*k + 1)
    z2 = z * z; // cache of z squared
    z4 = z2 * z2; // cache of z to the 4th

    values = [];
    for (k = 0; k < 100; k += 2) {
      a = 2 * k + 1;
      item = b / (a * m);
      item *= 1 - (a * z2) / ((a + 1) * (a + 2));
      values.push(item);
      m *= 4 * (k + 1) * (k + 2);
      b *= z4;
    }

    total = 0;
    for (k = 49; k >= 0; k--) {
      total += values[k];
    }

    return 0.5 + 0.3989422804014327 * total;
  },

  svgIcons: () => {
    return {
      star: `
      <svg data-testid="icon" class="icon" viewBox="0 0 16 16" version="1.1" width="16" height="16">
        <path fill-rule="evenodd" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"/>
      </svg>`,
      commits: `
      <svg data-testid="icon" class="icon" viewBox="0 0 16 16" version="1.1" width="16" height="16">
        <path fill-rule="evenodd" d="M1.643 3.143L.427 1.927A.25.25 0 000 2.104V5.75c0 .138.112.25.25.25h3.646a.25.25 0 00.177-.427L2.715 4.215a6.5 6.5 0 11-1.18 4.458.75.75 0 10-1.493.154 8.001 8.001 0 101.6-5.684zM7.75 4a.75.75 0 01.75.75v2.992l2.028.812a.75.75 0 01-.557 1.392l-2.5-1A.75.75 0 017 8.25v-3.5A.75.75 0 017.75 4z"/>
      </svg>`,
      prs: `
      <svg data-testid="icon" class="icon" viewBox="0 0 16 16" version="1.1" width="16" height="16">
        <path fill-rule="evenodd" d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z"/>
      </svg>`,
      issues: `
      <svg data-testid="icon" class="icon" viewBox="0 0 16 16" version="1.1" width="16" height="16">
        <path fill-rule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm9 3a1 1 0 11-2 0 1 1 0 012 0zm-.25-6.25a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5z"/>
      </svg>`,
      contribs: `
      <svg data-testid="icon" class="icon" viewBox="0 0 16 16" version="1.1" width="16" height="16">
        <path fill-rule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"/>
      </svg>`,
      fork: `
      <svg data-testid="icon" class="icon" viewBox="0 0 16 16" version="1.1" width="16" height="16">
        <path fill-rule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"></path>
      </svg>`,
    };
  },

  svgStyles: (theme, rank) => {
    return `<style xmlns="http://www.w3.org/2000/svg">
    .header {
      font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: ${theme == "dark" ? "#ffffff" : "#2f80ed"};
      animation: fadeInAnimation 0.8s ease-in-out forwards;
    }

    @supports(-moz-appearance: auto) {
      /* Selector detects Firefox */
      .header { font-size: 15.5px; }
    }
  
    .stat {
      font: 600 14px 'Segoe UI', Ubuntu, "Helvetica Neue", Sans-Serif; fill: ${
        theme == "dark" ? "#9f9f9f" : "#333333"
      };
    }

    @supports(-moz-appearance: auto) {
      /* Selector detects Firefox */
      .stat { font-size:12px; }
    }

    .stagger {
      opacity: 0;
      animation: fadeInAnimation 0.3s ease-in-out forwards;
    }

    .rank-text {
      font: 800 24px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${
        theme == "dark" ? "#9f9f9f" : "#333333"
      }; 
      animation: scaleInAnimation 0.3s ease-in-out forwards;
    }

    .bold { font-weight: 700 }

    .icon {
      fill: ${theme == "dark" ? "#79ff97" : "#4c71f2"};
      display: block;
    }

    .rank-circle-rim {
      fill: none;
      stroke-width: 6;
      opacity: 0.2;
    }

    .S_SCORE {
      stroke: #eacb2f;
    }
    .A_PLUS_SCORE {
      stroke: #1eb300;
    }
    .A_SCORE {
      stroke: #2fa0ed;
    }
    .B_PLUS_SCORE {
      stroke: #ed962f;
    }
    .B_SCORE {
      stroke: #7d00b3;
    }
    .C_SCORE {
      stroke: #b30000;
    }

    .animationS_SCORE {
      animation: rankAnimationS_SCORE 1s forwards ease-in-out;
    }
    .animationA_PLUS_SCORE {
      animation: rankAnimationA_PLUS_SCORE 1s forwards ease-in-out;
    }
    .animationA_SCORE {
      animation: rankAnimationA_SCORE 1s forwards ease-in-out;
    }
    .animationB_PLUS_SCORE {
      animation: rankAnimationB_PLUS_SCORE 1s forwards ease-in-out;
    }
    .animationB_SCORE {
      animation: rankAnimationB_PLUS_SCORE 1s forwards ease-in-out;
    }
    .animationC_SCORE {
      animation: rankAnimationC_SCORE 1s forwards ease-in-out;
    }

    .rank-circle {
      stroke-dasharray: 250;
      fill: none;
      stroke-width: 6;
      stroke-linecap: round;
      opacity: 0.8;
      transform-origin: -10px 8px;
      transform: rotate(-90deg);
    }

    @keyframes rankAnimationS_SCORE {
      from {
        stroke-dashoffset: 251;
      }
      to {
        stroke-dashoffset: 0; 
      }
    }
    @keyframes rankAnimationA_PLUS_SCORE {
      from {
        stroke-dashoffset: 251;
      }
      to {
        stroke-dashoffset: 45; 
      }
    }
    @keyframes rankAnimationA_SCORE {
      from {
        stroke-dashoffset: 251;
      }
      to {
        stroke-dashoffset: 95; 
      }
    }
    @keyframes rankAnimationB_PLUS_SCORE {
      from {
        stroke-dashoffset: 251;
      }
      to {
        stroke-dashoffset: 145; 
      }
    }
    @keyframes rankAnimationB_SCORE {
      from {
        stroke-dashoffset: 251;
      }
      to {
        stroke-dashoffset: 190; 
      }
    }
    @keyframes rankAnimationC_SCORE {
      from {
        stroke-dashoffset: 251;
      }
      to {
        stroke-dashoffset: 240; 
      }
    }
  
    /* Animations */
    @keyframes scaleInAnimation {
      from {
        transform: translate(-5px, 5px) scale(0);
      }
      to {
        transform: translate(-5px, 5px) scale(1);
      }
    }

    @keyframes fadeInAnimation {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  </style>`;
  },

  svgTitle: (details, year) => {
    return `
    <g xmlns="http://www.w3.org/2000/svg" data-testid="card-title" transform="translate(25, 35)">
      <g transform="translate(0, 0)">
        <text x="0" y="0" class="header" data-testid="header">${details.name}' GitHub Stats ${year}</text>
      </g>
    </g>`;
  },

  svgCircle: (rank) => {
    return `
    <g xmlns="http://www.w3.org/2000/svg" data-testid="rank-circle" transform="translate(400, 47.5)">
      <circle class="rank-circle-rim ${rank.id}" cx="-58" cy="8" r="40"/>
      <circle class="rank-circle ${rank.id} animation${
      rank.id
    }" cx="-10" cy="-40" r="40"/>
      <g class="rank-text">
        <text x="${
          rank.letterSign.length > 1 ? -50 : -54
        }" y="0" alignment-baseline="central" dominant-baseline="central" text-anchor="middle">
          ${rank.letterSign}
        </text>
      </g>
    </g>`;
  },

  svgContent: (details) => {
    return `
    <svg xmlns="http://www.w3.org/2000/svg" x="0" y="0">
      <g transform="translate(0, 0)">
        <g class="stagger" style="animation-delay: 450ms" transform="translate(25, 0)">
          ${self.svgIcons().star}
          <text class="stat bold" x="25" y="12.5">Total Stars Earned:</text>
          <text class="stat" x="170" y="12.5" data-testid="stars">${
            details.stars
          }</text>
        </g>
      </g>
      <g transform="translate(0, 25)">
        <g class="stagger" style="animation-delay: 600ms" transform="translate(25, 0)"> 
          ${self.svgIcons().commits}
          <text class="stat bold" x="25" y="12.5">Total Commits:</text>
          <text class="stat" x="170" y="12.5" data-testid="commits">${
            details.commits
          }</text>
        </g>
      </g>
      <g transform="translate(0, 50)">
        <g class="stagger" style="animation-delay: 750ms" transform="translate(25, 0)">
          ${self.svgIcons().prs}
          <text class="stat bold" x="25" y="12.5">Total PRs:</text>
          <text class="stat" x="170" y="12.5" data-testid="prs">${
            details.pullRequests
          }</text>
        </g>
      </g>
      <g transform="translate(0, 75)">
        <g class="stagger" style="animation-delay: 900ms" transform="translate(25, 0)">
          ${self.svgIcons().issues}
          <text class="stat bold" x="25" y="12.5">Total Issues:</text>
          <text class="stat" x="170" y="12.5" data-testid="issues">${
            details.issues
          }</text>
        </g>
      </g>
      <g transform="translate(0, 100)">
        <g class="stagger" style="animation-delay: 1050ms" transform="translate(25, 0)">
          ${self.svgIcons().contribs}
          <text class="stat bold" x="25" y="12.5">Contributed to:</text>
          <text class="stat" x="170" y="12.5" data-testid="contribs">${
            details.collaborations
          }</text>
        </g>
      </g>
    </svg>`;
  },

  svgBackground: (theme) => {
    return `
    <rect xmlns="http://www.w3.org/2000/svg" data-testid="card-bg" x="0.5" y="0.5" rx="4.5" height="99%" stroke="#e4e2e2" width="420" fill="${
      theme == "dark" ? "#151515" : "#fffefe"
    }" stroke-opacity="1"/>`;
  },

  createSvg: (theme, details, year, rank) => {
    return `
    <svg xmlns="http://www.w3.org/2000/svg" width="450" height="195" viewBox="0 0 495 195" fill="none">
      ${self.svgStyles(theme, rank)}
      ${self.svgBackground(theme)}
      ${self.svgTitle(details, year)}   
      <g data-testid="main-card-body" transform="translate(0, 55)">
        ${self.svgCircle(rank)}
        ${self.svgContent(details)}
      </g>
    </svg>
    `;
  },
});
