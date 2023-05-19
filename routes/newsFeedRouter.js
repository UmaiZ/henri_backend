const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const newsFeedController = require("../controllers/newsFeedController");

router.post("/createNewsFeed", auth, newsFeedController.addNewsFeed);
router.put("/updateNewsFeed/:id", auth, newsFeedController.updateNewsFeed);
router.delete("/deleteNewsFeed/:id", auth, newsFeedController.deleteNewsFeed);
router.get("/getNewsFeed", auth, newsFeedController.getNewsFeed);
router.get("/getNewsFeedById/:newsFeedId", auth, newsFeedController.getNewsFeedById);
router.post("/shareNewsFeed/:newsFeedId", auth, newsFeedController.shareNewsFeed);
router.post("/likeNewsFeed/:newsFeedId", auth, newsFeedController.likePost);
router.post("/commentNewsFeed", auth, newsFeedController.commentNewsFeed);
router.put("/updateCommentNewsFeed", auth, newsFeedController.updateCommentNewsFeed);
router.delete("/deleteCommentNewsFeed", auth, newsFeedController.deleteCommentNewsFeed);
router.get("/newsFeedComment", auth, newsFeedController.getCommentsOfFeed);
router.post("/ratingnewsFeed/:newsFeedId", auth, newsFeedController.ratingPost);
router.get("/getAverageRating",auth,newsFeedController.getRatingAverage);


module.exports = router;
