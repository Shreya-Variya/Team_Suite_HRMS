const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const employeeStatsController = require("../controllers/employeestats");

//Api for return the employees current months working hours
router
  .route("/getworkhour/:empid")
  .get(wrapAsync(employeeStatsController.getCurrentMonthWorkHours));

//Api for return the number of present and absent days of employees in current month
router
  .route("/getcurrentmonthattendance/:empid")
  .get(wrapAsync(employeeStatsController.getCurrentMonthAttendance));

//Api for return the total number of leaves in this month of particular employee
router
  .route("/getleavebalance/:empid")
  .get(wrapAsync(employeeStatsController.getLeaveBalance));

module.exports = router;
