const express = require('express');
const { getUser, createUser, userLogin, updateUser, deleteUser, getAllUsers, userLogout, forgotPassword, resetPassword, updatePassword } = require('../controller/userController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.route('/user/signup').post(createUser);
router.route('/user/login').post(userLogin);
router.route('/user/logout').get(userLogout);

router.route('/user/password/forgot').post(forgotPassword);
router.route('/user/password/reset/:token').put(resetPassword);
router.route('/user/password/update').put(authenticate, updatePassword);

router.route('/user/profile').get(authenticate, getUser);
router.route('/user/profile/update').put(authenticate, updateUser);
router.route('/user/profile/delete').delete(authenticate, deleteUser);

router.route('/user/all').get(authenticate, getAllUsers);
module.exports = router;