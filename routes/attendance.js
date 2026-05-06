const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendance.js");
const wrapAsync = require("../utils/wrapAsync.js");

//Api which make user to clock in and insert that record into attendance and attendanceHistory table
router.route("/clockin/:empid").post(wrapAsync(attendanceController.clockin));

//Api which make user to break in and insert that record into attendanceHistory table
router.route("/breakin/:empid").post(wrapAsync(attendanceController.breakin));

//Api which make user to break out and update that record into attendance and attendanceHistory table
router.route("/breakout/:empid").post(wrapAsync(attendanceController.breakout));

//Api which make user to clock out and update that record into attendance and attendanceHistory table
router.route("/clockout/:empid").post(wrapAsync(attendanceController.clockout));

//Api which returns the employee attendance report
router
  .route("/weeklyreport/:empid")
  .get(attendanceController.getAttendanceReport);

//Api which returns the all employees today's attendance report for particular company
router
  .route("/empattendance/:companyid")
  .get(attendanceController.getEmployeeAttendanceReport);

//Api which returns the all employees attendance report of particular date for particular company
router
  .route("/date/:companyid")
  .post(wrapAsync(attendanceController.attendanceByDate));

module.exports = router;
