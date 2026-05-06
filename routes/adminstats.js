const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const adminStatsController = require("../controllers/adminstats.js");

//Api for get the total number of employees of company
router
  .route("/totalemployees/:companyid")
  .get(wrapAsync(adminStatsController.getTotalEmployees));

//Api for get todays present and absent employees of company
router
  .route("/todaysattendance/:companyid")
  .get(wrapAsync(adminStatsController.todaysAttendance));

//Api for get the number of employee on leave today
router
  .route("/onleaveemployees/:companyid")
  .get(wrapAsync(adminStatsController.onLeaveEmployees));

module.exports = router;
