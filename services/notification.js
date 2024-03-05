const notificationModel = require("../model/notification");
const userModel = require("../model/user");

class NotificationService {
  constructor() { }

  async sendPostNotification(postid, user_id, showuserid, type) {
    try {
      const usercheck = await userModel.findById(user_id);
      console.log(usercheck);
      const notification = new notificationModel({
        showto: showuserid,
        notificationType: type === "all" ? "RANDOM" : "POST",
        notificationTitle: "",
        notificationSubtitle: "",
        postid: postid
      });
      await notification.save();
      console.log(notification);

    } catch (err) {
      console.log(err);

    }
  }
}
module.exports = NotificationService;
