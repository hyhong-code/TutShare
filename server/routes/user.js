const router = require("express").Router();

const validate = require("../utils/validators");
const { setUpdateInterestsCheck } = require("../utils/validators/user");

const { updateInterests } = require("../controllers/user");
const auth = require("../middlewares/auth");

router
  .route("/interests")
  .patch(auth, setUpdateInterestsCheck, validate, updateInterests);

module.exports = router;
