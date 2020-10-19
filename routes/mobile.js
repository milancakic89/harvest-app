const express = require('express');
const mobileController = require('./../controllers/mobile');
const isAuth = require('../middleware/isAuth');

const router = express.Router();

router.post("/measurement/update", isAuth, mobileController.postUpdateMeasurement);
router.get("/measurement", isAuth, mobileController.getMeasurement);
router.post("/measurement/record", isAuth, mobileController.postMeasurement);
router.post("/barcode/record", isAuth, mobileController.postBarcode);
router.post("/measurement", isAuth, mobileController.postFilter);
router.get('/total', isAuth, mobileController.getMobileReport);
router.post('/filterEmployee', isAuth, mobileController.postEmployee);
router.get('/barcode', isAuth, mobileController.getBarcode)
router.get('/barcode/:box', isAuth, mobileController.getBoxBarcode)
router.post('/upload', isAuth, mobileController.postUpload)
router.get("/boxes/:id", isAuth, mobileController.getIdBoxes);

module.exports = router;