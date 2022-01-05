const mongo = require("mongoose");
const Schema = mongo.Schema;

const gitStatsSchema = new Schema({
  year: {
    type: String,
    trim: true,
  },
  name: {
    type: String,
    trim: true,
  },
  login: {
    type: String,
    trim: true,
  },
  stars: {
    type: Number,
    trim: true,
  },
  commits: {
    type: Number,
    trim: true,
  },
  pullRequests: {
    type: Number,
    trim: true,
  },
  issues: {
    type: Number,
    trim: true,
  },
  collaborations: {
    type: Number,
    trim: true,
  },
});

module.exports = mongo.model("git_stats", gitStatsSchema, "git_stats");
