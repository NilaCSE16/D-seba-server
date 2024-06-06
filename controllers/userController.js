const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const doctorModel = require("../models/doctorModel");
const appointModel = require("../models/appointmentModel");
const moment = require("moment");

const registerController = async (req, res) => {
  try {
    const existingUser = await userModel.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(401).send({
        success: false,
        message: "User Already Exist",
      });
    }
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;
    // console.log("req body:", req.body);
    const newUser = new userModel(req.body);
    // console.log(newUser);
    await newUser.save();
    res.status(200).send({
      success: true,
      message: "Register Successfully",
      newUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Login",
      error,
    });
  }
};

const loginController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (user) {
      const validPAssword = bcrypt.compareSync(
        req.body.password,
        user.password
      );
      if (!validPAssword) {
        return res.status(401).send({
          success: false,
          message: "Incorrect credentials",
        });
      }
    } else {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
    const token = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN, {
      expiresIn: "1h",
    });
    return res.status(200).send({
      success: true,
      message: "Successfully login",
      token,
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in Login",
      error,
    });
  }
};

const signInWithGoogle = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    // console.log(req.body.email);
    if (user) {
      const token = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN, {
        expiresIn: "1h",
      });
      return res.status(200).send({
        success: true,
        message: "Register Successfully with google",
        token,
        user,
      });
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(generatedPassword, salt);
      req.body.password = hashedPassword;
      const newUser = new userModel(req.body);
      //   {
      //   name: req.body.name,
      //   email: req.body.email,
      //   password: hashedPassword,
      //   isAdmin: false,
      //   isDoctor: false,
      //   notification,
      //   seenNotification,
      // });
      await newUser.save();
      const token = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN, {
        expiresIn: "1h",
      });
      return res.status(200).send({
        success: true,
        message: "Google registration successful",
        token,
        newUser,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Google Login",
      error,
    });
  }
};

const authController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    } else {
      res.status(200).send({
        success: true,
        message: "User found",
        data: user,
        // {
        //   name: user.name,
        //   email: user.email,
        // },
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Auth error",
      error,
    });
  }
};

const applyDoctorController = async (req, res) => {
  console.log(req.body);
  try {
    const newDoctor = await doctorModel({ ...req.body, status: "Pending" });
    await newDoctor.save();
    const adminUser = await userModel.findOne({ isAdmin: true });
    const notification = adminUser.notification;
    notification.push({
      type: "apply-doctor-request",
      message: `${newDoctor.firstName} ${newDoctor.lastName} has applied for a doctor account`,
      data: {
        doctorId: newDoctor._id,
        name: newDoctor.firstName + " " + newDoctor.lastName,
        onClickPath: "/admin/doctors",
      },
    });
    await userModel.findByIdAndUpdate(adminUser._id, { notification });
    res.status(200).send({
      success: true,
      message: "Doctor Account applied successfully",
      newDoctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Applying doctor",
      error,
    });
  }
};

const getAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    const seenNotification = user.seenNotification;
    const notification = user.notification;
    seenNotification.push(...notification);
    user.notification = [];
    user.seenNotification = notification;
    // console.log(user.seenNotification);
    const updatedUser = await user.save();
    res.status(200).send({
      success: true,
      message: "All notification marked as read",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get all notification",
      error,
    });
  }
};

const deleteAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    user.notification = [];
    user.seenNotification = [];
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({
      success: true,
      message: "Notification Deleted Successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in delete all notification",
      error,
    });
  }
};

//get all doctors controller
const getAllDoctorsController = async (req, res) => {
  try {
    const doctors = await doctorModel.find({ status: "Approved" });
    res.status(200).send({
      success: true,
      message: "Doctors list fetch Successfully",
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in fetching all doctors",
      error,
    });
  }
};

//book appointment controller
const bookAppointmentController = async (req, res) => {
  try {
    req.body.date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    req.body.time = moment(req.body.time, "HH:mm").toISOString();
    req.body.status = "Pending";
    const newAppointment = new appointModel(req.body);
    await newAppointment.save();
    const user = await userModel.findOne({ _id: req.body.doctorInfo.userId });
    user.notification.push({
      type: "New appointment request",
      message: `A new appointment request from ${req.body.userInfo.name}`,
      onClickPath: "/appointments",
    });
    await user.save();
    res.status(200).send({
      success: true,
      message: "Appointment book Successfully",
      // data: doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in booking appointment",
      error,
    });
  }
};

//booking Availability Controller
const bookingAvailabilityController = async (req, res) => {
  try {
    const date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    const fromTime = moment(req.body.time, "HH:mm")
      .subtract(1, "hours")
      .toISOString();
    const toTime = moment(req.body.time, "HH:mm").add(1, "hours").toISOString();
    const doctorId = req.body.doctorId;
    const appointments = await appointModel.find({
      doctorId,
      date,
      time: {
        $gte: fromTime,
        $lte: toTime,
      },
    });
    if (appointments.length > 0) {
      return res.status(200).send({
        success: false,
        message: "Appointments not available at this time",
      });
    } else {
      return res.status(200).send({
        success: true,
        message: "Appointments available",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in booking",
      error,
    });
  }
};

const userAppointmentController = async (req, res) => {
  try {
    const appointments = await appointModel.find({ userId: req.body.userId });
    return res.status(200).send({
      success: true,
      message: "User Appointments fetch successfully",
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in user appointments",
      error,
    });
  }
};

module.exports = {
  loginController,
  registerController,
  signInWithGoogle,
  applyDoctorController,
  authController,
  getAllNotificationController,
  deleteAllNotificationController,
  getAllDoctorsController,
  bookAppointmentController,
  bookingAvailabilityController,
  userAppointmentController,
};
