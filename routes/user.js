const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");

const limiter = require("../middleware/throttleservice");
const auth = require("../middleware/auth");

router.post("/register", limiter, userController.registerUser);
router.post("/login", limiter, userController.loginUser);
// router.put("/updateUser",auth,limiter, userController.updateUser);
router.post("/updateUser", auth, limiter, userController.updateUser);
router.get("/getUserByUserID/:id", userController.getUserByUserID);
// router.post("/updateUser", limiter, auth, userController.updateUser);

router.post("/followOrUnfollow", limiter, auth, userController.followOrUnfollow);
router.get("/getUsersFans", auth, userController.getUsersFans);
router.get("/getUserTeamMates", auth, userController.getUserTeamMates);



module.exports = router;
