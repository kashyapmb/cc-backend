const express = require('express');
const { getAllTopics, getTopicDetails, followUnfollow, createTopic, updateTopic, deleteTopic, getFollowingTopics } = require('../controller/topicController');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

router.route('/topic/create').post(createTopic);
router.route('/topic/all').get(getAllTopics);
router.route('/topic/following').get(getFollowingTopics);
router.route('/topic/:id').get(getTopicDetails).put(updateTopic).delete(deleteTopic);

router.route('/topic/follow/:id').post(authenticate,followUnfollow);
module.exports = router;