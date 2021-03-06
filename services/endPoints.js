const { endpoint } = require("@octokit/endpoint");
const { graphql } = require("@octokit/graphql");
const axios = require("axios");
const json = require("./json");

module.exports = {
  getGitStats: async (username) => {
    return await graphql(
      `
        query ($username: String!) {
          user(login: $username) {
            avatarUrl
            websiteUrl
            company
            email
            location
            name
            twitterUsername
            url
            login
            followers {
              totalCount
            }
            repositories(
              ownerAffiliations: [OWNER, COLLABORATOR]
              isFork: false
              first: 100
            ) {
              nodes {
                name
                isPrivate
                owner {
                  login
                }
                stargazerCount
                languages(
                  first: 10
                  orderBy: { field: SIZE, direction: DESC }
                ) {
                  edges {
                    size
                    node {
                      color
                      name
                    }
                  }
                }
              }
            }
          }
        }
      `,
      {
        username: username,
        headers: {
          authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
      }
    );
  },

  getRepositories: async (username, basic) => {
    const query = `
    query ($username: String!) {
      user(login: $username) {
        repositories(
          first: 100
          ownerAffiliations: [OWNER, COLLABORATOR]
        ) {
          nodes {
            isPrivate
            name
            url
            description
            stargazerCount
            usesCustomOpenGraphImage
            openGraphImageUrl
            owner {
              login
            }
            repositoryTopics(first: 10) {
              nodes {
                topic {
                  name
                }
              }
            }
            ${
              basic
                ? ``
                : `
            updatedAt
            createdAt
            forkCount
            isArchived
            hasWikiEnabled
            homepageUrl
            licenseInfo {
              name
              hidden
            }
            defaultBranchRef {
              target {
                ... on Commit {
                  history(first: 1) {
                    totalCount
                  }
                }
              }
            }
            issues(
              orderBy: { field: CREATED_AT, direction: ASC }
              first: 100
            ) {
              totalCount
              nodes {
                state
              }
            }
            pullRequests(first: 1) {
              totalCount
            }
            labels(first: 10) {
              nodes {
                color
                description
                name
                isDefault
              }
            }
            primaryLanguage {
              color
              name
            }
            languages(
              first: 10
              orderBy: { field: SIZE, direction: DESC }
            ) {
              edges {
                size
                node {
                  color
                  name
                }
              }
            }
            collaborators {
              nodes {
                avatarUrl
                login
                name
                url
              }
            }
            releases(first: 10) {
              nodes {
                author {
                  login
                }
                name
                description
                tagName
                url
                isDraft
                publishedAt
                tagCommit {
                  zipballUrl
                }
                releaseAssets(last: 10) {
                  nodes {
                    name
                    size
                    downloadCount
                    downloadUrl
                  }
                }
              }
            }
            projectsUrl
            projects(first: 10) {
              nodes {
                name
                url
              }
            }`
            }
          }
        }
      }
    }`;
    return await graphql(query, {
      username: username,
      headers: {
        authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    });
  },

  getPrivateCollabs: async (username) => {
    return await graphql(
      `
        query ($username: String!) {
          user(login: $username) {
            name
            repositories(first: 100, ownerAffiliations: COLLABORATOR) {
              totalCount
              edges {
                repository: node {
                  name
                  isPrivate
                  createdAt
                  updatedAt
                }
              }
            }
          }
        }
      `,
      {
        username: username,
        headers: {
          authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
      }
    );
  },

  getStars: async (username) => {
    return await graphql(
      `
        query ($username: String!) {
          user(login: $username) {
            login
            repositories(
              first: 100
              ownerAffiliations: OWNER
              orderBy: { direction: DESC, field: STARGAZERS }
            ) {
              nodes {
                id
                name
                isPrivate
                stargazers(first: 20) {
                  totalCount
                  nodes {
                    createdAt
                    updatedAt
                  }
                }
              }
            }
          }
        }
      `,
      {
        username,
        headers: {
          authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
      }
    );
  },

  getPullRequests: async (username) => {
    return await graphql(
      `
        query ($username: String!) {
          user(login: $username) {
            repositories(first: 100) {
              edges {
                repository: node {
                  id
                  name
                  isPrivate
                  createdAt
                  updatedAt
                  pullRequests(
                    first: 100
                    orderBy: { field: CREATED_AT, direction: ASC }
                  ) {
                    totalCount
                    edges {
                      cursor
                      pullRequest: node {
                        id
                        author {
                          login
                        }
                        createdAt
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `,
      {
        username,
        headers: {
          authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
      }
    );
  },

  getPullRequestsWithCursor: async (username, first, cursor) => {
    return await graphql(
      `
        query ($username: String!, $cursor: String!, $first: Int!) {
          user(login: $username) {
            repositories(first: 100) {
              edges {
                repository: node {
                  id
                  name
                  isPrivate
                  createdAt
                  updatedAt
                  pullRequests(
                    first: $first
                    orderBy: { field: CREATED_AT, direction: ASC }
                    after: $cursor
                  ) {
                    totalCount
                    edges {
                      cursor
                      pullRequest: node {
                        id
                        author {
                          login
                        }
                        createdAt
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `,
      {
        first,
        cursor,
        username,
        headers: {
          authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
      }
    );
  },

  getIssues: async (username) => {
    return await graphql(
      `
        query ($username: String!) {
          user(login: $username) {
            contributionsCollection {
              totalCommitContributions
              restrictedContributionsCount
            }
            repositories(first: 100) {
              edges {
                repository: node {
                  isPrivate
                  name
                  createdAt
                  updatedAt
                  issues(first: 100) {
                    totalCount
                    edges {
                      node {
                        id
                        author {
                          login
                        }
                        createdAt
                        updatedAt
                        assignees(first: 10) {
                          nodes {
                            login
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `,
      {
        username,
        headers: {
          authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
      }
    );
  },
};
