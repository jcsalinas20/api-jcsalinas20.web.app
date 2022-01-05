const mongo = require("mongoose")
const Schema = mongo.Schema

const gitContactSchema = new Schema({
    type: {
        type: String,
        trim: true
    },
    name: {
        type: String,
        trim: true
    },
    subject: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true,
    }
})

module.exports = mongo.model("git_contact", gitContactSchema, "git_contact")