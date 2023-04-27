const mongoose = require("mongoose")

const doubtSchema = new mongoose.Schema({
    author: {
        type: {
            _id: mongoose.Schema.Types.ObjectId,
            username: String,
            firstName: String,
            lastName: String,
            email: String,
            avatar: {
                public_id: String,
                url: String
            }
        },
        required: true,
        ref: "User"
    },
    content: {
        type: String,
        require: true,
        minLength: [10, "Please provide valid input."]
    },
    answers: {
        type: [{ type: mongoose.Schema.Types.ObjectId }],
        ref: "Answer",
        default: []
    },
    edited: {
        type: Boolean,
        default: false
    },
    tags: [{ type: String }],
    images: {
        type: [{
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }],
        default: []
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
},
    { timestamps: true }
)

const Doubt = mongoose.model("Doubt", doubtSchema);
module.exports = Doubt;