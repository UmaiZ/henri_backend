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

// const responseHandler = require("./utils/ResponseHandler/responseHandler");

app.use(chatRoomRouter);
app.use(newsFeedRouter);
app.use(userRouter);
app.use(statusRouter);

// app.get('/generate-token', (req, res) => {
//   const appId = process.env.APP_ID;
//   const appCertificate = process.env.APP_CERTIFICATE;
//   const channelName = req.query.channelName;
//   const uid = req.query.uid || Math.floor(Math.random() * 100000);
//   const role = req.query.role || "publisher";
//   if (!appId || !appCertificate) {
//     return res.status(400).json({ error: "Missing required parameters" });
//   }

//   // Additional validation for channel name and role
//   if (!channelName || typeof channelName !== "string") {
//     return res.status(400).json({ error: "required channel name" });
//   }

//   if (role !== "publisher" && role !== "subscriber") {
//     return res.status(400).json({ error: "Invalid role" });
//   }
//   const agoraToken = generateAgoraToken(appId, appCertificate, channelName, uid.toString(), role);

//   res.json({ token: agoraToken });
// });


app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Server Running" });
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
mongoose.connect(process.env.COLLECTION, {
  dbName: process.env.DB_NAME
})
  .then(() => {
    console.log("database connected");
  })
  .catch(() => {
    console.log("database not connected");
  })


const PORT = process.env.PORT || 6011;
server.listen(PORT, (err) => {
  console.log(`App listening on port ${PORT}!`);
  if (err) console.log(err);
});
// app.listen(PORT, () => { console.log(`App listening on port ${PORT}!`); });

module.exports = server;
