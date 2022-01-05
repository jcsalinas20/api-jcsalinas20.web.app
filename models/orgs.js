const mongo = require("mongoose")
const Schema = mongo.Schema

const gitOrgsSchema = new Schema({
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
    name: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    id: {
        type: String,
        trim: true
    }
})

module.exports = mongo.model("git_orgs", gitOrgsSchema, "git_orgs")