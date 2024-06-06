const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getAllUsersController,
  getAllDoctorsController,
  changeAccountStatusController,
} = require("../controllers/adminController");

const router = express.Router();

//get users list
router.get("/getAllUsers", authMiddleware, getAllUsersController);

//get doctors list
router.get("/getAllDoctors", authMiddleware, getAllDoctorsController);

//status change
router.post(
  "/changeAccountStatus",
  authMiddleware,
  changeAccountStatusController
);

module.exports = router;
