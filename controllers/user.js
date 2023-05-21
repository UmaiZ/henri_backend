var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { Users } = require("../model/user");
const multer = require("multer");
const { uploadFileWithFolder } = require("../utils/awsFileUploads");

const uploadOptions = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});


const registerUser = async (req, res) => {
    const usercheck = await Users.find({
        userEmail: req.body.userEmail,
    }).lean();
    if (usercheck.length != 0) {
        return res
            .status(200)
            .json({ message: "user email already exist", success: false });
    }
    // Const Match Regex for password 
    // const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
    if (!req.body.isSocial) {
        // if (!passwordRegex.test(req.body.userPassword)) {
        //     return res.status(200).json({
        //         success: false,
        //         message: "Password must be 8 characters long and must contain at least one uppercase letter, one lowercase letter, one number and one special character.",
        //     });
        // }
    }
    const user = Users({
        userEmail: req.body.userEmail,
        userName: req.body.userName,
        userPassword: req.body.isSocial
            ? ""
            : bcrypt.hashSync(req.body.userPassword, 8),
    });
    const token = jwt.sign({ user_id: user._id }, process.env.TOKEN_KEY, {
        expiresIn: "7d",
    });
    // save user token
    user.userToken = token;
    try {
        const usersave = await user.save();
        res.status(200).json({
            success: true,
            data: usersave,
            message: "User saved successfully",
        });
    } catch (err) {
        if (err.name === "ValidationError") {
            console.error(Object.values(err.errors).map((val) => val.message));
            return res.status(400).json({
                success: false,
                message: Object.values(err.errors).map((val) => val.message)[0],
            });
        }
        return res.status(400).json({ success: false, message: err });
    }
};

const loginUser = async (req, res) => {
    try {
        let user = null;
        if (req.body.userEmail) {
            user = await Users.findOne({ userEmail: req.body.userEmail }).lean();
        } else {
            user = await Users.findOne({ userNumber: req.body.userNumber }).lean();
        }
        if (!user) {
            return res.status(200).json({ message: "user not found", success: false });
        }

        if (user.userSocialToken) {
            const token = jwt.sign({ user_id: user._id }, process.env.TOKEN_KEY, {
                expiresIn: "7d",
            });
            user.userToken = token;
            return res
                .status(200)
                .json({ message: "user logged in as social", success: false });
        }
        if (user && bcrypt.compareSync(req.body.userPassword, user.userPassword)) {
            const token = jwt.sign({ user_id: user._id }, process.env.TOKEN_KEY, {
                expiresIn: "7d",
            });
            user.userToken = token;
            return res
                .status(200)
                .json({ message: "login successfully", data: user, success: true });
        }
        return res.status(200).json({ message: "login failed", success: false });
    } catch (err) {
        console.log(err);
        if (err.name === "ValidationError") {
            console.error(Object.values(err.errors).map((val) => val.message));
            return res.status(400).json({
                success: false,
                message: Object.values(err.errors).map((val) => val.message)[0],
            });
        }
        return res.status(400).json({ success: false, message: err });
    }
};

const updateUser = async (req, res) => {


    console.log('hit')
    if (req.body.userName) {
        const usercheck = await Users.find({
            userName: req.body.userName,
        });
        if (usercheck.length != 0) {
            return res
                .status(200)
                .json({ message: "user name already exist", success: false });
        }
    }

    try {
        var userImage = req.body.userImage;
        if (req.file.userImage) {
            console.log('saving image');
            const file = req.files.userImage[0];
            const fileName = file.originalname;
            const fileContent = file.buffer;

            const fileLocation = await uploadFileWithFolder(
                fileName,
                "newsFeed",
                fileContent
            );
            userImage = fileLocation;
        }

        var userCover = req.body.userCover;

        console.log(req.file.userCover);
        if (req.file.userCover) {
            console.log('saving image');
            const file = req.files.userCover[0];
            const fileName = file.originalname;
            const fileContent = file.buffer;

            const fileLocation = await uploadFileWithFolder(
                fileName,
                "newsFeed",
                fileContent
            );
            userCover = fileLocation;
        }
        const updateUser = await Users.findByIdAndUpdate(
            req.user.user_id,
            {
                userEmail: req.body.userEmail,
                userName: req.body.userName,
                userCity: req.body.userCity,
                userAddress: req.body.userAddress,
                userCountry: req.body.userCountry,
                userNumber: req.body.userNumber,
                userSchool: req.body.userSchool,
                userTeam: req.body.userTeam,
                userCoaches: req.body.userCoaches,
                userBio: req.body.userBio,
                userSports: req.body.userSports,
                userImage: userImage,
                userCover: userCover
            },
            {
                new: true,
            }
        );
        res.status(200).json({
            success: true,
            data: updateUser,
            message: "User saved successfully",
        });
    } catch (err) {
        console.log(err)
        if (err.name === "ValidationError") {
            console.error(Object.values(err.errors).map((val) => val.message));
            return res.status(400).json({
                success: false,
                message: Object.values(err.errors).map((val) => val.message)[0],
            });
        }
        return res.status(400).json({ success: false, message: err });
    }



};


const getUserByUserID = async (req, res) => {
    const user = await Users.findById(req.params.id);
    if (!user) {
        return res.status(200).json({ message: "user not found", success: false });
    }

    return res
        .status(200)
        .json({ message: "success", success: true, data: user });
};

const followOrUnfollow = async (req, res) => {
    try {
        const { user_id } = req.user;
        const { follow_id } = req.body;
        if (follow_id == null || follow_id == undefined || follow_id == "") {
            return res
                .status(200)
                .json({ message: "FollowerId Required", success: false });
        }
        if (follow_id == user_id) {
            return res
                .status(200)
                .json({ message: "You can't follow yourself", success: false });
        }
        const user = await Users.findOne({ _id: user_id }).lean();
        const follower = await Users.findOne({ _id: follow_id }).lean();
        // if (!user) {
        //   return res
        //     .status(200)
        //     .json({ message: "user not found", success: false });
        // }
        // // check Follower
        // const checkFollower = await Users.findOne({ _id: follow_id }).lean();
        // if (!checkFollower) {
        //   return res
        //     .status(200)
        //     .json({ message: "user not found", success: false });
        // }
        // Check already follow or not
        const checkFollow = await Users.findOne({
            _id: user_id,
            userFollowing: { $in: [follow_id] },
        }).lean();
        if (checkFollow) {
            // Unfollow
            const unfollow = await Users.findOneAndUpdate(
                { _id: user_id },
                {
                    $pull: { userFollowing: follow_id },
                }
            );
            await Users.findOneAndUpdate(
                { _id: follow_id },
                {
                    $pull: { userFollowers: user_id },
                },
                { new: true }
            );

            if (!unfollow) {
                return res.status(200).json({
                    message: "unfollow not done",
                    success: false,
                });
            }
            return res.status(200).json({
                message: "unfollow done",
                success: true,
                follow: false
            });
        } else {
            // Follow
            const follow = await Users.findOneAndUpdate(
                { _id: user_id },
                {
                    $push: { userFollowing: follow_id },
                }
            );
            await Users.findOneAndUpdate(
                { _id: follow_id },
                {
                    $push: { userFollowers: user_id },
                },
                { new: true }
            );
            // sendNotification(
            //   follower.userNotificationToken,
            //   "Follow",
            //   `${user.userName} follow you`
            // );
            // const notificationFollo = {
            //   userID: follower._id.toString(),
            //   title: "Follow",
            //   message: `${user.userName} follow you`,
            // };
            // await axios.post(
            //   `${process.env.mainserverurl}/notification/createUsersNotification`,
            //   notificationFollo
            // );
            // sendNotification(
            //   user.userNotificationToken,
            //   "Follow",
            //   `You follow ${follower.userName}`
            // );
            // const followNotification = {
            //   userID: user._id.toString(),
            //   title: "Follow",
            //   message: `You follow ${follower.userName}`,
            // };
            // await axios.post(
            //   `${process.env.mainserverurl}/notification/createUsersNotification`,
            //   followNotification
            // );

            if (!follow) {
                return res.status(200).json({
                    message: "follow not done",
                    success: false,
                });
            }
            return res.status(200).json({
                message: "follow done",
                success: true,
                follow: true

            });
        }
    } catch (err) {
        return res.status(400).json({ success: false, message: err });
    }
};


const getUsersFans = async (req, res) => {
    try {
        const user = await Users.findById(req.user.user_id).populate(['userFollowers']);
        return res
            .status(200)
            .json({ message: "success", success: true, data: user.userFollowers });
    } catch (err) {
        return res.status(400).json({ success: false, message: err });
    }
};


const getUserTeamMates = async (req, res) => {
    try {
        const user = await Users.findById(req.user.user_id).populate(['userFollowers', 'userFollowing']);



        const commonObjects = user.userFollowers.filter(obj1 => user.userFollowing.some(obj2 => obj2.userName === obj1.userName));
        return res
            .status(200)
            .json({ message: "success", success: true, data: commonObjects });
    } catch (err) {
        return res.status(400).json({ success: false, message: err });
    }
};



module.exports = {
    registerUser,
    loginUser,
    getUserByUserID,
    followOrUnfollow,
    getUserTeamMates,
    getUsersFans,
    updateUser: [uploadOptions.fields([{
        name: 'image', maxCount: 1
    }, {
        name: 'coverimage', maxCount: 1
    }]), updateUser],

};
