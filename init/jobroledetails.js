const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("../connection/dbconnection.js");
const Jobrole = require("../models/jobrole.js");

const jobroles = [
  //Information Technology (IT)
  {
    departmentId: "69fb0643a69cf19f4e081550",
    role: "Software Developer",
  },
  {
    departmentId: "69fb0643a69cf19f4e081550",
    role: "Systems Administrator",
  },
  {
    departmentId: "69fb0643a69cf19f4e081550",
    role: "IT Project Manager",
  },
  {
    departmentId: "69fb0643a69cf19f4e081550",
    role: "Network Engineer",
  },
  {
    departmentId: "69fb0643a69cf19f4e081550",
    role: "Cybersecurity Analyst",
  },
  {
    departmentId: "69fb0643a69cf19f4e081550",
    role: "Data Scientist",
  },
  {
    departmentId: "69fb0643a69cf19f4e081550",
    role: "Database Administrator (DBA)",
  },
  //Administration
  {
    departmentId: "69fb0643a69cf19f4e081551",
    role: "Administrative Assistant",
  },
  {
    departmentId: "69fb0643a69cf19f4e081551",
    role: "Office Manager",
  },
  {
    departmentId: "69fb0643a69cf19f4e081551",
    role: "Executive Assistant",
  },
  {
    departmentId: "69fb0643a69cf19f4e081551",
    role: "Receptionist",
  },
  {
    departmentId: "69fb0643a69cf19f4e081551",
    role: "Facilities Manager",
  },
  //Executive Management/Leadership
  {
    departmentId: "69fb0643a69cf19f4e081552",
    role: "Chief Executive Officer (CEO)",
  },
  {
    departmentId: "69fb0643a69cf19f4e081552",
    role: "Chief Financial Officer (CFO)",
  },
  {
    departmentId: "69fb0643a69cf19f4e081552",
    role: "Chief Operating Officer (COO)",
  },
  {
    departmentId: "69fb0643a69cf19f4e081552",
    role: "Chief Technology Officer (CTO)",
  },
  {
    departmentId: "69fb0643a69cf19f4e081552",
    role: "Vice President (VP) / Executive Director",
  },
  //Human Resources (HR)
  {
    departmentId: "69fb0643a69cf19f4e081553",
    role: "Recruiter",
  },
  {
    departmentId: "69fb0643a69cf19f4e081553",
    role: "HR Generalist",
  },
  {
    departmentId: "69fb0643a69cf19f4e081553",
    role: "Compensation and Benefits Manager",
  },
  {
    departmentId: "69fb0643a69cf19f4e081553",
    role: "Learning and Development Specialist",
  },
  {
    departmentId: "69fb0643a69cf19f4e081553",
    role: "HR Analyst",
  },
  //Finance and Accounting
  {
    departmentId: "69fb0643a69cf19f4e081554",
    role: "Accountant",
  },
  {
    departmentId: "69fb0643a69cf19f4e081554",
    role: "Financial Analyst",
  },
  {
    departmentId: "69fb0643a69cf19f4e081554",
    role: "Controller",
  },
  {
    departmentId: "69fb0643a69cf19f4e081554",
    role: "Auditor",
  },
  {
    departmentId: "69fb0643a69cf19f4e081554",
    role: "Payroll Specialist",
  },
  //Operations / Production
  {
    departmentId: "69fb0643a69cf19f4e081555",
    role: "Operations Manager",
  },
  {
    departmentId: "69fb0643a69cf19f4e081555",
    role: "Logistics Coordinator",
  },
  {
    departmentId: "69fb0643a69cf19f4e081555",
    role: "Production Planner",
  },
  {
    departmentId: "69fb0643a69cf19f4e081555",
    role: "Quality Assurance (QA) Specialist",
  },
  {
    departmentId: "69fb0643a69cf19f4e081555",
    role: "Supply Chain Manager",
  },
  //Product Management
  {
    departmentId: "69fb0643a69cf19f4e081556",
    role: "Product Manager",
  },
  {
    departmentId: "69fb0643a69cf19f4e081556",
    role: "Product Owner",
  },
  {
    departmentId: "69fb0643a69cf19f4e081556",
    role: "UX/UI Designer",
  },
  {
    departmentId: "69fb0643a69cf19f4e081556",
    role: "Market Analyst",
  },
  //Sales
  {
    departmentId: "69fb0643a69cf19f4e081557",
    role: "Sales Representative / Account Executive",
  },
  {
    departmentId: "69fb0643a69cf19f4e081557",
    role: "Sales Manager",
  },
  {
    departmentId: "69fb0643a69cf19f4e081557",
    role: "Business Development Representative (BDR)",
  },
  {
    departmentId: "69fb0643a69cf19f4e081557",
    role: "Sales Operations Analyst",
  },
  //Marketing
  {
    departmentId: "69fb0643a69cf19f4e081558",
    role: "Marketing Manager",
  },
  {
    departmentId: "69fb0643a69cf19f4e081558",
    role: "Content Strategist",
  },
  {
    departmentId: "69fb0643a69cf19f4e081558",
    role: "Digital Marketing Specialist",
  },
  {
    departmentId: "69fb0643a69cf19f4e081558",
    role: "Product Marketing Manager",
  },
  {
    departmentId: "69fb0643a69cf19f4e081558",
    role: "PR (Public Relations) Specialist",
  },
  //Research and Development (R&D)
  {
    departmentId: "69fb0643a69cf19f4e081559",
    role: "Research Scientist",
  },
  {
    departmentId: "69fb0643a69cf19f4e081559",
    role: "R&D Engineer",
  },
  {
    departmentId: "69fb0643a69cf19f4e081559",
    role: "Innovation Manager",
  },
  //Customer Service
  {
    departmentId: "69fb0643a69cf19f4e08155a",
    role: "Customer Service Representative",
  },
  {
    departmentId: "69fb0643a69cf19f4e08155a",
    role: "Customer Success Manager",
  },
  {
    departmentId: "69fb0643a69cf19f4e08155a",
    role: "Support Team Lead",
  },
  {
    departmentId: "69fb0643a69cf19f4e08155a",
    role: "Technical Support Specialist",
  },
  //Business Development
  {
    departmentId: "69fb0643a69cf19f4e08155b",
    role: "Business Development Manager",
  },
  {
    departmentId: "69fb0643a69cf19f4e08155b",
    role: "Partnership Manager",
  },
  {
    departmentId: "69fb0643a69cf19f4e08155b",
    role: "Alliance Manager",
  },
  {
    departmentId: "69fb0643a69cf19f4e08155b",
    role: "Market Research Analyst",
  },
];

Jobrole.insertMany(jobroles)
  .then((result) => {
    console.log("Saved Job Roles : ", result);
  })
  .catch((err) => {
    console.log("Job Roles not saved : ", err);
  });
