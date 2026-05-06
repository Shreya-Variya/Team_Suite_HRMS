const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const leaveController = require("../controllers/leave.js");

//Api which add the data when employees are apply for leave
router.route("/apply").post(wrapAsync(leaveController.applyForLeave));

//Api for accept the leave request
router.route("/accept").patch(wrapAsync(leaveController.acceptLeave));

//Api for reject the leave request
router.route("/reject").patch(wrapAsync(leaveController.rejectLeave));

//Api for getting the employee this month leave report
router.route("/:empid").get(wrapAsync(leaveController.getLeaveReport));

//Api for getting the all employees current month leave report for particular company
router
  .route("/leavereport/:companyid")
  .get(wrapAsync(leaveController.getEmployeeLeaveReport));

//Api for getting all employees all leave report for particular company
router.route("/all/:companyid").get(wrapAsync(leaveController.allLeaveRecord));

//Api for getting all approved leave records for particular company
router
  .route("/approved/:companyid")
  .get(wrapAsync(leaveController.approvedLeaves));

//Api for getting all pending leave records for particular company
router
  .route("/pending/:companyid")
  .get(wrapAsync(leaveController.pendingLeaves));

//Api for getting all rejected leave records for particular company
router
  .route("/rejected/:companyid")
  .get(wrapAsync(leaveController.rejectedLeaves));

//Api for getting all leave record of particular date for particular company
router.route("/date/:companyid").post(wrapAsync(leaveController.leaveByDate));

//Employee leave report apis
//Api for get the all leaves of employee
router
  .route("/allemp/:empid")
  .get(wrapAsync(leaveController.getAllLeaveRecords));

//Api for get the all approved leaves of employee
router
  .route("/approvedemp/:empid")
  .get(wrapAsync(leaveController.getApprovedLeaveRecords));

//Api for get the all pending leaves of employee
router
  .route("/pendingemp/:empid")
  .get(wrapAsync(leaveController.getPendingLeaveRecords));

//Api for get the all rejected leaves of employee
router
  .route("/rejectedemp/:empid")
  .get(wrapAsync(leaveController.getRejectedLeaveRecords));

module.exports = router;
