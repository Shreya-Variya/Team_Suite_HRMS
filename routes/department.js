const express = require("express");
const router = express.Router();
const Department = require("../models/department.js");

//Api for fetch all department details
router.route("/getdepartment").get(async (req, res) => {
  try {
    let department = await Department.find({});
    console.log("All Departments : ", department);
    return res.status(200).json({
      success: true,
      message: "All Department Data.",
      data: department,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
});

module.exports = router;
