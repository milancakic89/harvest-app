const express = require('express');
const addController = require('../controllers/add');
const isAuth = require('../middleware/isAuth');

const router = express.Router();

router.get("/add", isAuth, addController.getAdd);
router.post("/add/supervizor", isAuth, addController.postSupervizor)
router.post("/add/box", isAuth, addController.postBox);
router.post("/add/employee", isAuth, addController.postEmployee);
router.post("/add/variety", isAuth, addController.postVariety);

module.exports = router;