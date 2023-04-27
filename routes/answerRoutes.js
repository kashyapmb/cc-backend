const express = require("express");
const { createAnswer, updateAnswer, getAnswerDetails, deleteAnswer, getAllAnswersOfUser, likeUnlikeAnswer } = require("../controller/answerController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.route("/answer/create").post(authenticate, createAnswer);
router.route("/answer/all").get(authenticate, getAllAnswersOfUser);
router.route("/answer/:id").get(authenticate, getAnswerDetails).put(authenticate, updateAnswer).delete(authenticate, deleteAnswer);
router.route("answer/like/:id").post(authenticate, likeUnlikeAnswer);
module.exports = router;