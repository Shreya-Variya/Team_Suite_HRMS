const mongoose = require("mongoose");
const Company = require("../models/company");

//Controller that return the company data
module.exports.getCompanyDetails = async (req, res) => {
  try {
    const { companyid } = req.params;
    console.log(companyid);
    if (!mongoose.isValidObjectId(companyid)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format.",
      });
    } else {
      const company = await Company.findById(companyid);
      console.log(company);
      if (!company) {
        return res
          .status(404)
          .json({ success: false, message: "Company not found." });
      } else {
        return res.status(200).json({
          success: true,
          message: "Company data fetched successfully.",
          data: company,
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

//Copntroller for add the company details
module.exports.addCompany = async (req, res) => {
  try {
    const company = req.body.company;
    // console.log(req.body.company.companyName);
    // console.log(company);
    let findCompany = await Company.find({ companyName: company.companyName });
    console.log(findCompany);
    if (findCompany.length === 0) {
      let url = req.file.path;
      let filename = req.file.filename;
      console.log(req.file, url, filename);
      const newCompany = new Company(company);
      newCompany.logo = { url, filename };
      console.log(newCompany);
      let saveCompany = await newCompany.save();
      console.log(saveCompany);
      req.flash("success", "Company create & register successfully.");
      return res.redirect("/");
    } else {
      req.flash("error", "Company already exists.");
      return res.redirect("/");
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};
