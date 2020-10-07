const express = require("express");
const adminController = require("../controllers/admin");
const isAuth = require('../middleware/isAuth');

const router = express.Router();

router.get('/docs', adminController.getDocs)
router.get("/", isAuth, adminController.getFarming);
router.get("/record", isAuth, adminController.getBase);
router.get('/notification', isAuth, adminController.getNotification);
router.post('notification', isAuth, adminController.postNotification);
router.get("/base", isAuth, adminController.getBase);
router.get("/report", isAuth, adminController.getReport);
router.post('/employee', isAuth, adminController.getDeleteEmployee);
router.post('/deleteEmployee', isAuth, adminController.postDeleteEmployee);
router.post('/deleteBox', isAuth, adminController.postDeleteBoxes);
router.post('/transferBox', isAuth, adminController.postTransferBoxes)
router.get('/analyse', isAuth, adminController.getAnalises)
router.get("/employees", isAuth, adminController.getEmployees);
router.get('/print', isAuth, adminController.getPrint);
router.post('/printed', isAuth, adminController.postPrinted);
router.get('/help', isAuth, adminController.getHelp);
router.post("/", isAuth, adminController.postRecord);
router.post("/report/day", isAuth, adminController.postReport);
router.post("/report/close", isAuth, adminController.postCloseNewDay);

module.exports = router;
