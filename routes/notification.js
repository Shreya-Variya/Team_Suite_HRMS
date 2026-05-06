const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const notificationController = require("../controllers/notification.js");

//Api for save the fcm token
router.route("/savetoken").post(wrapAsync(notificationController.saveFcmToken));

//Api for remove the fcm token
router
  .route("/delete/:empid")
  .delete(wrapAsync(notificationController.removeFcmToken));

//Api for send notification to admin
router
  .route("/sendtoadmin")
  .post(wrapAsync(notificationController.sendNotificationToAdmin));

//Api for send notification to employee
router
  .route("/sendtoemployee")
  .post(wrapAsync(notificationController.sendNotificationToAEmployee));

module.exports = router;
