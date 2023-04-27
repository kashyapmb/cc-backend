const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema({

    label: { type: String, required: true },
    hashtag: { type: String, required: true },
    description: { type: String },
    avatar: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    },
    followers: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ]
    },
    posts: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Post"
            }
        ]
    },
    doubts: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Doubt"
            }
        ]
    }
});

const Topic = mongoose.model("Topic", topicSchema);

module.exports = Topic;