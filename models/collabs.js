const mongo = require("mongoose")
const Schema = mongo.Schema

const gitCollabSchema = new Schema({
    id: {
        type: String,
        trim: true
    },
    owner: {
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
    description: {
        type: String,
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
    type: {
        type: String,
        trim: true
    },
    languages: {
        type: Object,
        trim: true
    },
    contributors: {
        type: Object,
        trim: true
    },
    topics: {
        type: Array,
        trim: true
    },
    releases: {
        type: Array,
        trim: true
    },
    updated: {
        type: String,
        trim: true
    }
})

module.exports = mongo.model("git_collab", gitCollabSchema, "git_collab")