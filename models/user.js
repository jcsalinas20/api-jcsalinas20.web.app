const mongo = require("mongoose")
const Schema = mongo.Schema

const gitUserSchema = new Schema({
    type: {
        type: String,
        trim: true
    },
    username: {
        type: String,
        trim: true
    },
    avatar: {
        type: String,
        trim: true
    },
    blog: {
        type: String,
        trim: true
    },
    company: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true
    },
    followers: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        trim: true
    },
    name: {
        type: String,
        trim: true
    },
    public_repos: {
        type: String,
        trim: true
    },
    twitter: {
        type: String,
        trim: true
    },
    url: {
        type: String,
        trim: true
    },
    collaborations: {
        type: String,
        trim: true
    },
    stars: {
        type: String,
        trim: true
    },
    languages: {
        type: Array,
        trim: true
    }
})

module.exports = mongo.model("git_user", gitUserSchema, "git_user")