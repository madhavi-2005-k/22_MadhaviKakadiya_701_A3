const express = require("express");
const router = express.Router();
const Student = require("../models/Student");

// GET all students
router.get("/", async (req, res) => {
  const students = await Student.findAll();
  res.json(students);
});

// GET single student
router.get("/:id", async (req, res) => {
  const student = await Student.findByPk(req.params.id);
  if (!student) return res.status(404).json({ message: "Not found" });
  res.json(student);
});

// CREATE student
router.post("/", async (req, res) => {
  const student = await Student.create(req.body);
  res.status(201).json(student);
});

// UPDATE student
router.put("/:id", async (req, res) => {
  const student = await Student.findByPk(req.params.id);
  if (!student) return res.status(404).json({ message: "Not found" });
  await student.update(req.body);
  res.json(student);
});

// DELETE student
router.delete("/:id", async (req, res) => {
  const student = await Student.findByPk(req.params.id);
  if (!student) return res.status(404).json({ message: "Not found" });
  await student.destroy();
  res.json({ message: "Deleted" });
});

module.exports = router;
