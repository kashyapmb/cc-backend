const catchAcyncError = require("../middleware/catchAcyncError");
const ErrorHandler = require("../utils/ErrorHandler");
const Doubt = require("../models/Doubt");
const Event = require("../models/Event");
const Topic = require("../models/Topic");
const { default: mongoose } = require("mongoose");

exports.getFeedData = catchAcyncError(async (req, res, next) => {
    res.status(200).json({
        success: true,
        results: []
    })
})

exports.getRelatedDoubts = catchAcyncError(async (req, res, next) => {
    const tags = req.user.interests.map(item => item.label);
    const relatedDoubts = await Doubt.aggregate([
        { $match: { tags: { $in: tags } } },
        {
            $lookup: {
                from: 'topics',
                localField: 'tags',
                foreignField: 'label',
                as: 'topics'
            }
        },
        {
            $project: {
                author: 1,
                content: 1,
                answers: 1,
                edited: 1,
                tags: 1,
                images: 1,
                likes: 1,
                createdAt: 1,
                updatedAt: 1
            }
        }
    ]);

    if (!relatedDoubts) {
        return next(new ErrorHandler(500, "Failed to process the request"));
    }

    res.status(200).json({
        success: true,
        result: relatedDoubts
    })
})

exports.getSimilarDoubts = catchAcyncError(async (req, res, next) => {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
        return next(new ErrorHandler(404, "Doubt not found"));
    }
    const similarDoubts = await Doubt.aggregate([
        { $match: { $and: [{ _id: { $ne: doubt._id } }, { tags: { $in: doubt.tags } }] } },
    ]);
    if(!similarDoubts){
        return next(new ErrorHandler(500, "Failed to get similar doubts"));
    }
    res.status(200).json({
        success: true,
        result: similarDoubts
    })
})

exports.getNearbyEvents = catchAcyncError(async (req, res, next) => {
    const city = req.user.city;
    const longitude = city.coordinates[0];
    const latitude = city.coordinates[1];

    const events = await Event.aggregate([
        {
            $geoNear: {
                near: { type: "Point", coordinates: [longitude, latitude] },
                distanceField: "distance",
                spherical: true,
                maxDistance: 10000
            }
        }
    ])

    if (!events) {
        return next(new ErrorHandler(500, "Couldn't get nearby events"));
    }
    res.status(200).json({
        success: true,
        result: events
    })
})