const mongoose = require("mongoose");
const Company = require("../models/company.js");
const LeavePolicy = require("../models/leavepolicy.js");

//Controller which add the leave policy into database
module.exports.addLeavepPolicy = async (req, res) => {
  try {
    if (req.body == null) {
      res.status(400).json({
        success: false,
        message: "Please pass the necessary data.",
      });
    } else {
      let companyid = req.body.leave.companyId;
      // let leaveType = req.body.leave.leaveType;
      // let maxLeave = req.body.leave.maxLeave;
      // let maxConsecutiveLeave = req.body.leave.maxConsecutiveLeave;

      if (!mongoose.isValidObjectId(companyid)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ID format.",
        });
      }

      const company = await Company.findById(companyid);
      if (company == null) {
        return res
          .status(404)
          .json({ success: false, message: "Company not found." });
      } else {
        console.log(req.body.leave);
        const newLeavePolicy = new LeavePolicy(req.body.leave);
        const saveLeavePolicy = await newLeavePolicy.save();
        console.log(saveLeavePolicy);
        return res
          .status(200)
          .json({ success: true, message: "Leave Policy Added Successfully." });
      }
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

//Controller use to get the leave policy
module.exports.getLeavePolicy = async (req, res) => {
  try {
    let { companyid } = req.params;
    console.log(companyid);

    if (!mongoose.isValidObjectId(companyid)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format.",
      });
    }

    const company = await Company.findById(companyid);
    if (company == null) {
      return res
        .status(404)
        .json({ success: false, message: "Company not found." });
    } else {
      let leavepolicy = await LeavePolicy.find({ companyId: companyid });
      console.log(leavepolicy);

      if (!leavepolicy) {
        return res.status(404).json({
          success: false,
          message: "Leave policy not found for your company.",
        });
      } else {
        return res.status(200).json({
          success: true,
          message: "Leave policy found.",
          data: leavepolicy,
        });
      }
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};
