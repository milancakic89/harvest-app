const express = require('express');
const authController = require('../controllers/auth');
const isAuth = require('../middleware/isAuth');

const router = express.Router();

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.post('/signup', authController.postSignUp);
router.post('/logout', authController.postLogout);
router.get('/reset/:token', authController.getResetPasswordUser);
router.post('/change', authController.changePassword);
router.post('/reset', authController.resetPassword)
router.get('/logout', authController.getLogout);
router.get('/adminStatus', isAuth, authController.checkAdminStatus);

module.exports = router;