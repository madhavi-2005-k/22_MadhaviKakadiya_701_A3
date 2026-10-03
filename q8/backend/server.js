const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");
const studentRoutes = require("./routes/students");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/students", studentRoutes);

sequelize.sync().then(() => {
  app.listen(5000, () => console.log("Server running on port 5000"));
});
