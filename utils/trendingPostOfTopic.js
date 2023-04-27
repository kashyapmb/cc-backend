const catchAcyncError = require("../middleware/catchAcyncError");
const Post = require("../models/Post");
const ErrorHandler = require("./ErrorHandler");


const getTrendingPosts = catchAcyncError(async (topic) => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const trendingPosts = await Post.aggregate([
        { $match: { createdAt: { $gte: oneWeekAgo } } },
        { $unwind: '$tags' },
        {
            $group: {
                _id: '$tags',
                posts: {
                    $push: {
                        _id: '$_id',
                        author: '$author',
                        title: '$title',
                        content: '$content',
                        tags: '$tags',
                        location: '$location',
                        images: '$images',
                        edited: '$edited',
                        likes: '$likes',
                        createdAt: '$createdAt',
                    }
                },
                totalLikes: { $sum: '$likes' }
            }
        },
        { $sort: { totalLikes: -1 } },
        { $limit: 10 }
    ]).toArray();
    return trendingPosts;
})

module.exports = getTrendingPosts;