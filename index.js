const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const ChatRoomController = require("./controllers/chatServices");
// const generateAgoraToken = require('./utils/agoraTokenGenerate');
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/public/uploads", express.static(__dirname + "/public/uploads"));

// require('dotenv').config();
const newsFeedRouter = require("./routes/newsFeedRouter");
const userRouter = require("./routes/user");
const statusRouter = require("./routes/statusRouter");
const chatRoomRouter = require("./routes/chatRouter");
const channelRouter = require("./routes/channelRouter");
const notificationRouter = require("./routes/notification");

// const responseHandler = require("./utils/ResponseHandler/responseHandler");

app.use(chatRoomRouter);
app.use(newsFeedRouter);
app.use(userRouter);
app.use(statusRouter);
app.use(channelRouter);
app.use(notificationRouter);


app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Server Running v1" });
});
// app.use(responseHandler);

io.on("connection", (socket) => {
  // Join Chatroom
  console.log("connected");
  socket.on("joinRoom", (data) => {
    // socket.join(chatroom);
    socket.join(data.user);
    ChatRoomController.getChatRoomData(io, data);
  });
  // Leave Chatroom
  socket.on("leaveRoom", ({ chatroom, user }) => {
    // socket.leave(chatroom);

    socket.leave(user);

  });
  // Send Message
  socket.on("sendMessage", (data) => {
    ChatRoomController.sendMessages(io, data);
  });
  // Get Chatroom Data
  // socket.on("getRoomDetails", (data) => {
  //   messageController.getChatRoomData(io, data);
  // });
});


mongoose.set("strictQuery", false);
mongoose.connect("mongodb+srv://umaiz:ZkCgeXWjp9ZZjjC7@cluster0.pmpvie3.mongodb.net/henri", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("database connected");
})
  .catch((err) => {
    console.log(err);
    console.log("database not connected");
  })



server.listen(5000, (err) => {
  console.log(`App listening on port ${5000}!`);
  if (err) console.log(err);
});
// app.listen(PORT, () => { console.log(`App listening on port ${PORT}!`); });

module.exports = server;




























