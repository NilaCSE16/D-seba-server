const express = require("express");
const colors = require("colors");
const morgan = require("morgan");
require("dotenv").config();
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

//middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

//mongodb connection
connectDB();

const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.status(200).send({
    message: "Server is running",
  });
});

//routes
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/doctor", require("./routes/doctorRoutes"));

app.listen(port, () => {
  console.log(
    `Server is running in ${process.env.NODE_MODE} mode on port: ${port}`
  );
});
