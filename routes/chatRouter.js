const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const ChatRoomController = require("../controllers/chatController");

router.post("/createChatRoom", auth, ChatRoomController.createChatRoom);
router.get("/getChatRooms", auth, ChatRoomController.getChatRooms);

module.exports = router;
