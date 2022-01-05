module.exports = {
  user: (user) => {
    return {
      username: user.login,
      avatar: user.avatar_url,
      blog: user.blog,
      company: user.company,
      email: user.email,
      followers: user.followers,
      location: user.location,
      name: user.name,
      public_repos: user.public_repos,
      twitter: user.twitter_username,
      url: user.html_url,
    };
  },
};
