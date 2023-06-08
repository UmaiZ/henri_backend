const express = require("express");
const router = express.Router();
const channelController = require("../controllers/channelControler");

const auth = require("../middleware/auth");

router.get("/generate-token",auth,channelController.agoraTokenGenerate);
module.exports = router;
