const catchAcyncError = require("../middleware/catchAcyncError");
const Doubt = require("../models/Doubt");
const Post = require("../models/Post");
const Topic = require("../models/Topic");
const User = require("../models/User");
const ErrorHandler = require("../utils/ErrorHandler");
const { getTrendingPosts } = require("../utils/trendingPostOfTopic");


exports.createTopic = catchAcyncError(async (req, res, next) => {
    const topic = await Topic.create(req.body);
    if (!topic) {
        return next(new ErrorHandler(500, "Failed to add topic"));
    }
    res.status(201).json({
        success: true,
        result: topic
    })
})

exports.updateTopic = catchAcyncError(async (req, res, next) => {
    const topic = await Topic.findByIdAndUpdate(req.params.id);
    if (!topic) {
        return next(new ErrorHandler(500, "Failed to update topic"));
    }
    res.status(200).json({
        success: true,
        result: topic
    })
})

exports.deleteTopic = catchAcyncError(async (req, res, next) => {
    const topic = await Topic.findByIdAndRemove(req.params.id);
    if (!topic) {
        return next(new ErrorHandler(500, "Failed to delete topic"));
    }
    res.status(200).json({
        success: true,
        message: "Topic deleted successfully"
    })
})

exports.getAllTopics = catchAcyncError(async (req, res, next) => {

    const topics = await Topic.find();

    if (!topics) {
        return next(new ErrorHandler(500, "Internal server error"));
    }
    res.status(200).json({
        success: true,
        result: topics
    })
});

exports.getTopicDetails = catchAcyncError(async (req, res, next) => {
    let topic = await Topic.findOne({ _id: req.params.id }).populate('posts doubts').exec();

    if (!topic) {
        return next(new ErrorHandler(404, "Topic not found"));
    }

    // const posts = await Post.find({ _id: { $in: topic.posts } });
    // const doubts = await Doubt.find({ _id: { $in: topic.doubts } });

    // topic.posts = posts;
    // topic.doubts = doubts;

    res.status(200).json({
        success: true,
        result: topic
    })
});

exports.followUnfollow = catchAcyncError(async (req, res, next) => {
    const topic = await Topic.findById(req.params.id);

    if (!topic) {
        return next(new ErrorHandler(500, "Internal server error"));
    }

    const index = topic.followers.indexOf(req.user._id);

    if (index !== -1) {
        topic.followers.splice(index, 1);
        await topic.save();

        // user.interests = user.interests.filter((item) => item._id !== topic._id);
        await User.findByIdAndUpdate({ _id: req.user._id }, { $pull: { interests: { _id: topic._id } } });

        res.status(200).json({
            success: true,
            message: "Topic unfollowed successfully!!"
        })
    } else {
        topic.followers.push(req.user._id)
        await topic.save();

        // user.interests.push(topic.label);
        await User.findByIdAndUpdate({ _id: req.user._id }, { $addToSet: { interests: { _id: topic._id, label: topic.label } } });

        res.status(200).json({
            success: true,
            message: "Topic followed successfully!!"
        })
    }
});

exports.getFollowingTopics = catchAcyncError(async (req, res, next) => {
    const user = await User.findById(req.query.user_id);
    if (!user) {
        return next(new ErrorHandler(404, "User not found"));
    }
    const topics = await Topic.find({ _id: { $in: user.interests } });

    if (!topics) {
        return next(new ErrorHandler(404, "Failed to get following topics"));
    }

    res.status(200).json({
        success: true,
        result: topics
    })
})