const Joi = require("joi");

module.exports.companySchema = Joi.object({
  company: Joi.object({
    companyName: Joi.string().required(),
    domain: Joi.string().required(),
    address: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
    }).required(),
    website: Joi.string(),
    email: Joi.string()
      .email({
        minDomainSegments: 1,
        tlds: { allow: ["com", "net", "in", "org"] },
      })
      .lowercase()
      .required(),
    about: Joi.string().required(),
    workingDay: Joi.object({
      monday: Joi.boolean(),
      tuesday: Joi.boolean(),
      wednesday: Joi.boolean(),
      thursday: Joi.boolean(),
      friday: Joi.boolean(),
      saturday: Joi.boolean(),
      sunday: Joi.boolean(),
    }).required(),
    startTime: Joi.string().required(),
    endTime: Joi.string().required(),
  }).required(),
});

module.exports.employeeSchema = Joi.object({
  employee: Joi.object({
    employeeId: Joi.string().required(),
    employeeName: Joi.string().required(),
    dob: Joi.date().required(),
    gender: Joi.string().required(),
    maritalStatus: Joi.boolean(),
    email: Joi.string()
      .email({
        minDomainSegments: 1,
        tlds: { allow: ["com", "net", "in", "org"] },
      })
      .lowercase()
      .required(),
    mobileNo: Joi.string()
      .length(10)
      .pattern(/^[0-9]+$/)
      .required(),
    address: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
    }).required(),
    education: Joi.string().required(),
    experience: Joi.number().required(),
    department: Joi.string().required(),
    jobRole: Joi.string().required(),
    joinDate: Joi.date().required(),
    companyId: Joi.string(),
    companyName: Joi.string(),
  }).required(),
});

module.exports.userLoginSchema = Joi.object({
  userlogin: Joi.object({
    email: Joi.string()
      .email({
        minDomainSegments: 1,
        tlds: { allow: ["com", "net", "in", "org"] },
      })
      .lowercase()
      .required(),
    password: Joi.string()
      .pattern(new RegExp("^(?=.*?[^a-zA-Z0-9])[a-zA-Z0-9^&@#_%$]{3,30}$"))
      .required(),
  }).required(),
});

module.exports.leavePolicySchema = Joi.object({
  leavepolicy: Joi.object({
    leaveType: Joi.string().required(),
    maxLeavePerYear: Joi.number().required(),
    maxConsecutiveLeave: Joi.number().required(),
  }).required(),
});

module.exports.leaveSchema = Joi.object({
  leave: Joi.object({
    startDate: Joi.date().required(),
    endDate: Joi.date(),
    reason: Joi.string().required(),
    status: Joi.string().required(),
  }).required(),
});
