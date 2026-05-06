const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const companyController = require("../controllers/company.js");
const { validateCompany } = require("../middleware.js");
const { storage } = require("../cloudConfig.js");
const multer = require("multer");
const upload = multer({ storage });

//Api for getting company data
router.route("/:companyid").get(wrapAsync(companyController.getCompanyDetails));

//Api for redirect to create company page
router.route("/").get((req, res) => {
  res.render("company");
});

//Api for create company
router
  .route("/")
  .post(
    upload.single("company[logo]"),
    validateCompany,
    wrapAsync(companyController.addCompany),
  );

module.exports = router;
