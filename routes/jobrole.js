const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const JobRole = require("../models/jobrole.js");

//Api which fetch all job role according department selected by user
router.route("/jobrole/:id").get(async (req, res) => {
  try {
    let { id } = req.params;
    console.log(id);
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format.",
      });
    }
    let jobroles = await JobRole.find({ departmentId: id });
    console.log("JobRoles : ", jobroles);
    return res.status(200).json({
      success: true,
      message: "All Job Roles Data.",
      data: jobroles,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
});

module.exports = router;
