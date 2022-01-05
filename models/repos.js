const mongo = require("mongoose")
const Schema = mongo.Schema

const gitReposSchema = new Schema({
    id: {
        type: String,
        trim: true
    },
    name: {
        type: String,
        trim: true
    },
    url: {
        type: String,
        trim: true
    },
    languages: {
        type: Object,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    releases: {
        type: Array,
        trim: true
    },
    stars: {
        type: String,
        trim: true
    },
    archived: {
        type: Boolean,
        trim: true
    },
    topics: {
        type: Array,
        trim: true
    },
    type: {
        type: String,
        trim: true
    },
    owner: {
        type: String,
        trim: true
    },
    updated: {
        type: String,
        trim: true
    }
})

module.exports = mongo.model("git_repos", gitReposSchema, "git_repos")