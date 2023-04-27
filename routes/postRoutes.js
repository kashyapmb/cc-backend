const express = require("express");
const { createPost, getAllPostsOfUser, getPostDetails, updatePost, deletePost, likeUnlikePost } = require("../controller/postController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.route('/post/create').post(authenticate, createPost);
router.route('/post/all').get(authenticate, getAllPostsOfUser);
router.route('/post/:id').get(authenticate, getPostDetails).put(authenticate, updatePost).delete(authenticate, deletePost);
router.route('/post/like/:id').post(authenticate, likeUnlikePost);
module.exports = router