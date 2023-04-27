const Answer = require("../models/Answer")
const Doubt = require("../models/Doubt")
const ErrorHandler = require("../utils/ErrorHandler")
const mongoose = require("mongoose")
const catchAcyncError = require("../middleware/catchAcyncError")

exports.createAnswer = catchAcyncError(async (req, res, next) => {
  if (!req.body.images && (req.body.content.length < 10)) {
    return next(new ErrorHandler(400, "Please provide valid content."));
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  let newAnswer;
  try {
    newAnswer = new Answer({
      author: {
        _id: req.user._id,
        username: req.user.username,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar
      },
      ...req.body
    });
    const savedAnswer = await newAnswer.save({ session });
    await Doubt.updateOne(
      { _id: req.body.doubt },
      { $push: { answers: savedAnswer._id } },
      { session }
    );

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    return next(new ErrorHandler(500, "Failed to add answer."))
  } finally {
    session.endSession();
    return res.status(201).json({
      success: true,
      result: newAnswer
    })
  }

})

exports.updateAnswer = catchAcyncError(async (req, res, next) => {
  if (!req.body.images && (req.body.content.length < 10)) {
    return next(new ErrorHandler(400, "Please provide valid content."));
  }
  const answer = await Answer.findByIdAndUpdate(req.params.id, {
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
  if (!answer) {
    return next(new ErrorHandler(500, "Failed to update the answer"));
  }
  return res.status(200).json({
    success: true,
    result: answer
  })
});

exports.deleteAnswer = catchAcyncError(async (req, res, next) => {
  const answer = await Answer.findByIdAndRemove(req.params.id);
  if (!answer) {
    return next(new ErrorHandler(500, "Failed to delete the answer."));
  }

  return res.status(200).json({
    success: true,
    message: "Answer deleted successfully."
  })
});

exports.getAnswerDetails = catchAcyncError(async (req, res, next) => {
  const answer = await Answer.findById(req.params.id);
  if (!answer) {
    return next(new ErrorHandler(404, "Answer not found."));
  }
  return res.status(200).json({
    success: true,
    result: answer
  });
});

exports.getAllAnswersOfUser = catchAcyncError(async (req, res, next) => {
  const allAnswers = await Answer.find({ author: req.query.user_id });
  if (!allAnswers) {
    return next(new ErrorHandler(404, "Failed to get answers."));
  }
  return res.status(200).json({
    success: true,
    result: allAnswers
  })
});

exports.likeUnlikeAnswer = catchAcyncError(async (req, res, next) => {
  let answer = await Answer.findById(req.params.id);
  const index = answer.likes.indexOf(req.user._id);

  if (!answer) {
    return next(new ErrorHandler(500, "Internal server error"));
  }
  if (index !== -1) {
    answer.likes.splice(index, 1);
    await answer.save();

    res.status(200).json({
      success: true,
      message: "Unliked successfully!!"
    })
  } else {
    answer.likes.push(req.user._id);
    await answer.save();
    res.status(200).json({
      success: true,
      message: "Liked successfully!!"
    })
  }
});