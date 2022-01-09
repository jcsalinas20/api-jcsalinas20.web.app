const s = require("./services");

module.exports = {
  repository: (repo, lang, releases) => {
    return {
      id: repo.id,
      owner: repo.owner.login,
      name: repo.name,
      url: repo.html_url,
      description: repo.description,
      languages: lang,
      releases: releases,
      stars: repo.stargazers_count,
      archived: repo.archived,
      topics: repo.topics,
      type: "repository",
      updated: repo.updated_at,
    };
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
        body: release.body,
        tagname: release.tag_name,
        url: release.html_url,
        draft: release.draft,
        published: release.published_at,
        src_zip_url: release.zipball_url,
        assets: [],
      };
      for (const asset of release.assets) {
        rel.assets.push({
          name: asset.name,
          size: asset.size,
          download_count: asset.download_count,
          download_url: asset.browser_download_url,
        });
      }
      rels.push(rel);
    }
    return rels;
  },

  collaboration: (collaboration, lang, releases, contributors) => {
    return {
      id: collaboration.id,
      owner: collaboration.owner.login,
      name: collaboration.name,
      url: collaboration.html_url,
      description: collaboration.description,
      stars: collaboration.stargazers_count,
      archived: collaboration.archived,
      type: "collaboration",
      languages: lang,
      contributors: contributors,
      topics: collaboration.topics,
      releases: releases,
      updated: collaboration.updated_at,
    };
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
};
