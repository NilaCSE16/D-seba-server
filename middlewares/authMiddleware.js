const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  //   console.log("Middleware");
  try {
    const token = req.headers["authorization"].split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, (error, decode) => {
      if (error) {
        return res.status(401).send({
          success: false,
          message: "Authentication failed",
        });
      } else {
        console.log(decode.userId);
        req.body.userId = decode.userId;
        next();
      }
    });
  } catch (error) {
    console.log(error);
    res.status(401).send({
      success: false,
      message: "Authentication failed",
    });
  }
};
