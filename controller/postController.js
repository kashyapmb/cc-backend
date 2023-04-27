const catchAcyncError = require("../middleware/catchAcyncError");
const Post = require("../models/Post");
const Topic = require("../models/Topic");
const ErrorHandler = require("../utils/ErrorHandler");

exports.createPost = catchAcyncError(async (req, res, next) => {
    if (!req.body.images && (req.body.content.length < 50)) {
        return next(new ErrorHandler(400, "Please provide valid content."));
    }
    const post = await Post.create({
        ...req.body,
        author: {
            _id: req.user._id,
            username: req.user.username,
            name: req.user.name,
            email: req.user.email,
            avatar: req.user.avatar
        }
    });
    const tags = req.body.tags;
    const bulkOps = [];
    for (let i = 0; i < tags.length; i++) {
        const tagName = tags[i];
        bulkOps.push({
            updateOne: {
                filter: { label: tagName },
                update: { $addToSet: { posts: post._id } }
            }
        });
    }

    const result = await Topic.bulkWrite(bulkOps);
    if (!post || !result) {
        return next(new ErrorHandler(500, "Failed to create post!"));
    }
    return res.status(201).json({
        success: true,
        result: post
    })
})

exports.updatePost = catchAcyncError(async (req, res, next) => {
    if (!req.body.images && (req.body.content.length < 50)) {
        return next(new ErrorHandler(400, "Please provide valid content."));
    }
    const post = await Post.findByIdAndUpdate(req.params.id, {
        author: {
            _id: req.user._id,
            username: req.user.username,
            name: req.user.name,
            email: req.user.email,
            avatar: req.user.avatar
        },
        ...req.body,
        edited: true
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })
    if (!post) {
        return next(new ErrorHandler(500, "Failed to update the post."))
    }
    return res.status(200).json({
        success: true,
        result: post
    })
})

exports.likeUnlikePost = catchAcyncError(async (req, res, next) => {
    let post = await Post.findById(req.params.id);
    if (!post) {
        return next(new ErrorHandler(500, "Internal server error"));
    }
    const index = post.likes.indexOf(req.user._id);
    if (index !== -1) {
        post.likes.splice(index, 1);
        await post.save();
        res.status(200).json({
            success: true,
            message: "Like removed successfully!!"
        })
    } else {
        post.likes.push(req.user._id);
        await post.save();
        res.status(200).json({
            success: true,
            message: "Liked successfully!!"
        })
    }
});

exports.deletePost = catchAcyncError(async (req, res, next) => {
    const post = await Post.findByIdAndRemove(req.params.id);

    if (!post) {
        return next(new ErrorHandler(500, "Failed to delete the post."));
    }

    const bulkOps = post.tags.map((tag) => ({
        updateOne: {
            filter: { label: tag },
            update: { $pull: { posts: post._id } },
        },
    }));

    await Topic.bulkWrite(bulkOps);

    return res.status(200).json({
        success: true,
        message: "Post deleted successfully."
    })
})

exports.getPostDetails = catchAcyncError(async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
        return next(new ErrorHandler(404, "Post not found!"));
    }
    return res.status(200).json({
        success: true,
        result: post
    })
})

exports.getAllPostsOfUser = catchAcyncError(async (req, res, next) => {
    const allPosts = await Post.find({ author: req.query.user_id });
    if (!allPosts) {
        return next(new ErrorHandler(404, "Failed to get all posts"));
    }
    return res.status(200).json({
        success: true,
        result: allPosts
    })
})
