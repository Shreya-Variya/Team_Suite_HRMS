const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { validateEmployee } = require("../middleware.js");
const adminController = require("../controllers/admin.js");

//Api for redirect to create admin page
router.route("/").get((req, res) => {
  res.render("admin");
});

//Api for create admin
router.route("/").post(validateEmployee, wrapAsync(adminController.addAdmin));

module.exports = router;
