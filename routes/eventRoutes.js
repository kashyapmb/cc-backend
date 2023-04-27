const express = require('express');
const { createEvent, getEventDetails, updateEvent, deleteEvent, likeUnlikeEvent } = require('../controller/eventController');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

router.route('/event/create').post(authenticate, createEvent);
router.route('/event/:id').get(authenticate, getEventDetails).put(authenticate, updateEvent).delete(authenticate, deleteEvent);
router.route('/event/like/:id').post(authenticate, likeUnlikeEvent);

module.exports = router