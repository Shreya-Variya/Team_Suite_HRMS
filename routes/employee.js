const express = require("express");
const router = express.Router();
const { validateEmployee } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");
const employeeController = require("../controllers/employee.js");

//API Which add employee
router
  .route("/")
  .post(validateEmployee, wrapAsync(employeeController.addemployee));

//API which get specific employee
router.route("/getemp").get(wrapAsync(employeeController.getemp));

//API which update employee data
router
  .route("/:id")
  .put(validateEmployee, wrapAsync(employeeController.updateemployee));

//API which delete the employee
router.route("/:id").delete(wrapAsync(employeeController.deleteemployee));

//API which gets all employee data
router.route("/").get(wrapAsync(employeeController.displayemployee));

//API which gets the employee details according to company id
router
  .route("/:companyid")
  .get(wrapAsync(employeeController.getCompanyEmployees));

module.exports = router;
