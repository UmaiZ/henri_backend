const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const statusController = require("../controllers/statusController");

router.post("/createStatus", auth, statusController.createStatus);
router.get("/getStatus", auth, statusController.getStatus);
router.get("/getAverageRating",auth,statusController.getRatingAverage);

module.exports = router;
