const router = require("express").Router();

const validate = require("../utils/validators");
const {
  setRegisterChecks,
  setLoginChecks,
  setForgetPWChecks,
  setResetPWCheck,
} = require("../utils/validators/auth.js");
const {
  register,
  activate,
  login,
  loadUser,
  forgetPassword,
  resetPassword,
} = require("../controllers/auth.js");
const auth = require("../middlewares/auth");
const restrictTo = require("../middlewares/restrictTo");

// Initial register
router.route("/register").post(setRegisterChecks, validate, register);

// Activate user account
router.route("/activate").post(activate);

// Login
router.route("/login").post(setLoginChecks, validate, login);

// Forget password
router
  .route("/forget-password")
  .post(setForgetPWChecks, validate, forgetPassword);

// Reset password
router.route("/reset-password").post(setResetPWCheck, validate, resetPassword);

// For protecting client side user routes
router.route("/user").get(auth, restrictTo("user"), loadUser);

// For protecting client side admin routes
router.route("/admin").get(auth, restrictTo("admin"), loadUser);

// For loading user
router.route("/").get(auth, loadUser);

module.exports = router;
