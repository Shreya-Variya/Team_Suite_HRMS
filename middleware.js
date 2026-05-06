const ExpressError = require("./utils/ExpressError.js");
const { employeeSchema } = require("./schema.js");
const { companySchema } = require("./schema.js");

module.exports.validateEmployee = (req, res, next) => {
  if (req.body == undefined) {
    throw new ExpressError(400, "Employee details are required.");
  } else {
    let { error } = employeeSchema.validate(req.body);
    if (error) {
      let errMsg = error.details.map((el) => el.message).join(",");
      throw new ExpressError(400, errMsg);
    } else {
      next();
    }
  }
};

module.exports.validateCompany = (req, res, next) => {
  if (req.body == undefined) {
    throw new ExpressError(400, "Company details are required.");
  } else {
    let { error } = companySchema.validate(req.body);
    if (error) {
      let errMsg = error.details.map((el) => el.message).join(",");
      throw new ExpressError(400, errMsg);
    } else {
      next();
    }
  }
};
