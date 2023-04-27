const catchAcyncError = require("../middleware/catchAcyncError");
const Event = require("../models/Event");
const ErrorHandler = require("../utils/ErrorHandler");

exports.createEvent = catchAcyncError(async (req, res, next) => {
    const event = await Event.create({
        ...req.body,
        author: {
            _id: req.user._id,
            username: req.user.username,
            name: req.user.name,
            email: req.user.email,
            avatar: req.user.avatar
        }
    })
    if (!event) {
        return next(new ErrorHandler(500, "Failed to create event"));
    }
    res.status(201).json({
        success: true,
        result: event
    })
})
exports.updateEvent = catchAcyncError(async (req, res, next) => {
    const event = await Event.findByIdAndUpdate(req.params.id, {
        author: {
            _id: req.user._id,
            username: req.user.username,
            name: req.user.name,
            email: req.user.email,
            avatar: req.user.avatar
        },
        ...req.body,
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })
    if (!event) {
        return next(new ErrorHandler(500, "Failed to update event"));
    }
    res.status(200).json({
        success: true,
        result: event
    })
});
exports.getEventDetails = catchAcyncError(async (req, res, next) => {
    const event = await Event.findById(req.params.id);
    if (!event) {
        return next(new ErrorHandler(404, "Event not found"));
    }
    res.status(200).json({
        success: true,
        result: event
    })
})
exports.deleteEvent = catchAcyncError(async (req, res, next) => { 
    const event = await Event.findByIdAndRemove(req.params.id);
    if(!event){
        return next(new ErrorHandler(500, "Failed to delete the event"));
    }
    res.status(200).json({
        success: true,
        message: "Event deleted successfully!!"
    })
})

exports.likeUnlikeEvent = catchAcyncError(async(req,res,next)=>{
    let event = await Event.findById(req.params.id);
    if(!event){
        return next(new ErrorHandler(500, "Internal server error"));
    }
    const index = event.likes.indexOf(req.user._id);
    if (index !== -1) {
        event.likes.splice(index, 1);
        await event.save();
        res.status(200).json({
            success: true,
            message: "Like removed successfully!!"
        })
    } else {
        event.likes.push(req.user._id);
        await event.save();
        res.status(200).json({
            success: true,
            message: "Liked successfully!!"
        })
    }
})