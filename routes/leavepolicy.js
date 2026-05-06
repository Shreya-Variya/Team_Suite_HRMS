const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const leavePolicyController = require("../controllers/leavepolicy.js");

//Api for add leave policy
router.route("/add").post(wrapAsync(leavePolicyController.addLeavepPolicy));

//Api for getting all leave policy details
router
  .route("/:companyid")
  .get(wrapAsync(leavePolicyController.getLeavePolicy));

module.exports = router;
