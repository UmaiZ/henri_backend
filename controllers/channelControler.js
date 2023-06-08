const channelModel =require('../model/channelModel');
const generateAgoraToken =require('../utils/agoraTokenGenerate');


const agoraTokenGenerate = async (req, res) => {
    try {
      const { user_id } = req.user;
      console.log(user_id);
      const appId = process.env.APP_ID;
      const appCertificate = process.env.APP_CERTIFICATE;
      const channelName = req.query.channelName;
  
      // Validate user ID
      if (!user_id) {
        return res.status(400).json({ error: "User ID is not valid" });
      }
  
      const uid = user_id;
      const role = req.query.role || "publisher";
  
      if (!appId || !appCertificate) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
  
      // Additional validation for channel name and role
      if (!channelName || typeof channelName !== "string") {
        return res.status(400).json({ error: "Required channel name" });
      }
  
      if (role !== "publisher" && role !== "subscriber") {
        return res.status(400).json({ error: "Invalid role" });
      }
  
      const agoraToken = generateAgoraToken(appId, appCertificate, channelName, uid.toString(), role);
  
      
      // Save user info, channel name, and ID to MongoDB
      const user = await channelModel.findById(user_id);
      if (!user) {
        // User not found, create a new one
        const newUser = new channelModel({
          channelName,
          uid: uid.toString(),
          token: agoraToken // Save the token field in the model
        });
        await newUser.save();
      } else {
        // Update existing user
        user.channelName = channelName;
        user.uid = uid.toString();
        user.token = agoraToken; // Update the token field in the model
        await user.save();
      }
  
      res.json({ token: agoraToken });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };
  
  module.exports={agoraTokenGenerate}