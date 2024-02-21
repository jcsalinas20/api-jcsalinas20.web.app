const s = require("./services");

const self = (module.exports = {
  repositories: (publicRepos, basic) => {
    let repos = [];
    for (const repo of publicRepos) {
      const topics = self.topics(repo.repositoryTopics.nodes);
      const banner = repo.usesCustomOpenGraphImage
        ? repo.openGraphImageUrl
        : null;
      // if (!basic) {
      // const wikiUrl = repo.hasWikiEnabled ? repo.url + "/wiki" : null;
      // const blog = repo.homepageUrl ? repo.homepageUrl : null;
      // let license = (repo.licenseInfo) ? (repo.licenseInfo.hidden) ? null : repo.licenseInfo.name : null;
      // const issues = self.issues(repo.issues);
      // const labels = self.removeNodeProperty(repo.labels.nodes);
      // const languages = self.languages(repo.languages.edges);
      // const collaborators = self.collaborators(
      //   repo.owner.login,
      //   repo.collaborators.nodes
      // );
      // const releases = self.releases(repo.releases.nodes);
      // const projects = self.removeNodeProperty(repo.projects.nodes);
      // }
      if (basic) {
        repos.push({
          name: repo.name,
          url: repo.url,
          show: true,
          description: repo.description,
          stars: repo.stargazerCount,
          banner: banner,
          owner: repo.owner.login,
          topics: topics,
        });
      } else {
        repos.push({
          name: repo.name,
          url: repo.url,
          type: (repo.owner.login === "jcsalinas20") ? "owner" : "collaborator",
          description: repo.description,
          stars: repo.stargazerCount,
          banner: banner,
          owner: repo.owner.login,
          updatedAt: repo.updatedAt,
          createdAt: repo.createdAt,
          forks: repo.forkCount,
          isArchived: repo.isArchived,
          wikiUrl: repo.hasWikiEnabled ? repo.url + "/wiki" : null,
          blog: repo.homepageUrl ? repo.homepageUrl : null,
          license: repo.licenseInfo
            ? repo.licenseInfo.hidden
              ? null
              : repo.licenseInfo.name
            : null,
          commits: repo.defaultBranchRef.target.history.totalCount,
          issues: self.issues(repo.issues),
          pullRequests: repo.pullRequests.totalCount,
          labels: self.removeNodeProperty(repo.labels.nodes),
          topics: topics,
          mainLanguage: repo.primaryLanguage,
          languages: self.languages(repo.languages.edges),
          collaborators: self.collaborators(
            repo.owner.login,
            repo.collaborators.nodes
          ),
          releases: self.releases(repo.releases.nodes),
          projectsUrl: repo.projectsUrl,
          projects: self.removeNodeProperty(repo.projects.nodes),
        });
      }
    }
    return repos;
  },

  collaborators: (owner, nodes) => {
    let collaborators = [];
    for (const user of nodes) {
      if (user.login === owner) {
        collaborators.push({
          name: user.name,
          login: user.login,
          avatar: user.avatarUrl,
          url: user.url,
          isAdmin: true,
        });
      } else {
        collaborators.push({
          name: user.name,
          login: user.login,
          avatar: user.avatarUrl,
          url: user.url,
          isAdmin: false,
        });
      }
    }
    return collaborators;
  },

  issues: (issues) => {
    let issuesCount = { total: 0, open: 0, closed: 0 };
    if (issues.totalCount > 0) {
      for (const issue of issues.nodes) {
        if (issue.state === "CLOSED") {
          issuesCount.closed++;
        } else {
          issuesCount.open++;
        }
        issuesCount.total++;
      }
    }
    return issuesCount;
  },

  languages: (edges) => {
    let languages = [];
    for (const lang of edges) {
      languages.push({
        size: lang.size,
        name: lang.node.name,
        color: lang.node.color,
      });
    }
    return languages;
  },

  removeNodeProperty: (nodes) => {
    let values = [];
    for (const node of nodes) {
      values.push(node);
    }
    return values;
  },

  topics: (nodes) => {
    let topics = [];
    for (const node of nodes) {
      topics.push(node.topic.name);
    }
    return topics;
  },

  user: (user) => {
    const counts = s.countGitStats(user.repositories.nodes, user.login);
    return {
      username: user.login,
      avatar: user.avatarUrl,
      website: user.websiteUrl,
      company: user.company,
      email: user.email,
      followers: user.followers.totalCount,
      location: user.location,
      name: user.name,
      twitter: user.twitterUsername,
      url: user.rl,
      repos: counts.repos,
      stars: counts.stars,
      collabs: counts.collabs,
      languages: counts.langs,
    };
  },

  releases: (releases) => {
    let rels = [];
    for (const release of releases) {
      let rel = {
        owner: release.author.login,
        name: release.name,
        description: release.description,
        tagname: release.tagName,
        url: release.url,
        isDraft: release.isDraft,
        publishedAt: release.publishedAt,
        srcZipUrl: release.tagCommit.zipballUrl,
        assets: [],
      };
      for (const asset of release.releaseAssets.nodes) {
        rel.assets.push({
          name: asset.name,
          size: asset.size,
          downloadCount: asset.downloadCount,
          downloadUrl: asset.downloadUrl,
        });
      }
      rels.push(rel);
    }
    return rels;
  },

  stats: (name, stars, commits, pullRequests, issues, collaborations) => {
    const stats = {};
    for (const year in s.years("jsonDesc")) {
      stats[year] = {};
      stats[year].name = name;
      stats[year].stars = stars[year];
      stats[year].commits = commits[year];
      stats[year].pullRequests = pullRequests[year];
      stats[year].issues = issues[year];
      stats[year].collaborations = collaborations[year];
    }
    return stats;
  },
});
