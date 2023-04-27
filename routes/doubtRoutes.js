const express = require("express");
const { getAllAnswersOfADoubt } = require("../controller/answerController");
const { createDoubt, deleteDoubt, updateDoubt, getDoubtDetails, getAllDoubtsOfUser, likeUnlikeDoubt } = require("../controller/doubtController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.route("/doubt/create").post(authenticate, createDoubt);
router.route("/doubt/all").get(authenticate, getAllDoubtsOfUser);
router.route("/doubt/:id").get(authenticate, getDoubtDetails).put(authenticate, updateDoubt).delete(authenticate, deleteDoubt);
router.route("/doubt/like/:id").post(authenticate,likeUnlikeDoubt);
module.exports = router;