const s = require("./services");

const self = (module.exports = {
  repositories: (publicRepos) => {
    let repos = [];
    for (const repo of publicRepos) {
      const banner = repo.usesCustomOpenGraphImage
        ? repo.openGraphImageUrl
        : null;
      const wikiUrl = repo.hasWikiEnabled ? repo.url + "/wiki" : null;
      const blog = repo.homepageUrl ? repo.homepageUrl : null;
      let license = null;
      if (repo.licenseInfo) {
        license = repo.licenseInfo.hidden ? null : repo.licenseInfo.name;
      }
      const issues = self.issues(repo.issues);
      const labels = self.removeNodeProperty(repo.labels.nodes);
      const topics = self.removeNodeProperty(repo.labels.nodes);
      const languages = self.languages(repo.languages.edges);
      const collaborators = self.collaborators(
        repo.owner.login,
        repo.collaborators.nodes
      );
      const releases = self.releases(repo.releases.nodes);
      const projects = self.removeNodeProperty(repo.projects.nodes);
      repos.push({
        name: repo.name,
        url: repo.url,
        description: repo.description,
        stars: repo.stargazerCount,
        banner: banner,
        owner: repo.owner.login,
        updatedAt: repo.updatedAt,
        createdAt: repo.createdAt,
        forks: repo.forkCount,
        isArchived: repo.isArchived,
        wikiUrl: wikiUrl,
        blog: blog,
        license: repo.licenseInfo,
        commits: repo.defaultBranchRef.target.history.totalCount,
        issues: issues,
        pullRequests: repo.pullRequests.totalCount,
        labels: labels,
        topics: topics,
        mainLanguage: repo.primaryLanguage,
        languages: languages,
        collaborators: collaborators,
        releases: releases,
        projectsUrl: repo.projectsUrl,
        projects: projects,
      });
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

  contributors: (contributors) => {
    let contr = [];
    for (const contributor of contributors) {
      contr.push({
        username: contributor.login,
        avatar: contributor.avatar_url,
        url: contributor.html_url,
        commits: contributor.contributions,
      });
    }
    return contr;
  },

  stats: (name, stars, commits, pullRequests, issues, collaborations) => {
    const stats = {};
    for (const year in s.years()) {
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
