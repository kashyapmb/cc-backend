const catchAcyncError = require("../middleware/catchAcyncError");
const Answer = require("../models/Answer");
const Doubt = require("../models/Doubt");
const Topic = require("../models/Topic");
const ErrorHandler = require("../utils/ErrorHandler");
const mongoose = require("mongoose")

exports.createDoubt = catchAcyncError(async (req, res, next) => {
    if (!req.body.images && (req.body.content.length < 10)) {
        return next(new ErrorHandler(400, "Please provide valid content."));
    }
    const doubt = await Doubt.create({
        author: {
            _id: req.user._id,
            username: req.user.username,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            email: req.user.email,
            avatar: req.user.avatar
        },
        ...req.body
    });
    const tags = req.body.tags;
    const bulkOps = [];
    for (let i = 0; i < tags.length; i++) {
        const tagName = tags[i];
        bulkOps.push({
            updateOne: {
                filter: { label: tagName },
                update: { $addToSet: { doubts: doubt._id } }
            }
        });
    }

    const result = await Topic.bulkWrite(bulkOps);
    if (!doubt || !result) {
        return next(new ErrorHandler(500, "Failed to create doubt."));
    }
    return res.status(201).json({
        success: true,
        result: doubt
    })
})

exports.updateDoubt = catchAcyncError(async (req, res, next) => {
    if (!req.body.images && (req.body.content.length < 10)) {
        return next(new ErrorHandler(400, "Please provide valid content."));
    }
    const doubt = await Doubt.findByIdAndUpdate(req.params.id, {
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

    if (!doubt) {
        return next(new ErrorHandler(500, "Failed to update the doubt."));
    }
    return res.status(200).json({
        success: true,
        result: doubt
    })
})

exports.deleteDoubt = catchAcyncError(async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const doubt = await Doubt.findById(req.params.id);

        await Answer.deleteMany({ _id: { $in: doubt.answers } }).session(session);

        const bulkOps = doubt.tags.map((tag) => ({
            updateOne: {
                filter: { label: tag },
                update: { $pull: { doubts: doubt._id } },
            },
        }));

        await Topic.bulkWrite(bulkOps);
        await doubt.deleteOne({ session });
        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        return next(new ErrorHandler(500, "Failed to delete the doubt."))
    } finally {
        session.endSession();
        return res.status(200).json({
            success: true,
            message: "Doubt deleted successfully."
        })
    }

})

exports.getDoubtDetails = catchAcyncError(async (req, res, next) => {
    let doubt = await Doubt.findById(req.params.id).populate('answers');
    if (!doubt) {
        return next(new ErrorHandler(404, "Doubt not found!"));
    }
    return res.status(200).json({
        success: true,
        result: doubt
    })
})

exports.getAllDoubtsOfUser = catchAcyncError(async (req, res, next) => {
    const allDoubts = await Doubt.find({ author: req.query.user_id });
    if (!allDoubts) {
        return next(new ErrorHandler(404, "Failed to get all posts"));
    }
    return res.status(200).json({
        success: true,
        result: allDoubts
    })
})

exports.likeUnlikeDoubt = catchAcyncError(async (req, res, next) => {
    let doubt = await Doubt.findById(req.params.id);
    const index = doubt.likes.indexOf(req.user._id);

    if (!doubt) {
        return next(new ErrorHandler(500, "Internal server error"));
    }
    if (index !== -1) {
        doubt.likes.splice(index, 1);
        await doubt.save();

        res.status(200).json({
            success: true,
            message: "Unliked successfully!!"
        })
    } else {
        doubt.likes.push(req.user._id);
        await doubt.save();
        res.status(200).json({
            success: true,
            message: "Liked successfully!!"
        })
    }
});