
const { Status } = require("../model/status");
const {Highlights} =require("../model/highlights");
// const {ratingNewsFeedModel}=require("../model/ratingnewsfeedModel");
const multer = require("multer");
const { uploadFileWithFolder } = require("../utils/awsFileUploads");
const { Users } = require("../model/user");
const moment = require('moment');

const newsFeedModel = require("../model/newsFeedModel");

const uploadOptions = multer({
    storage: multer.memoryStorage(),
    // limits: {
    //     fileSize: 3145728,
    // },
});

const createStatus = async (req, res) => {
    try {
        const { text } = req.body;
        const { files } = req;
        const { user_id } = req.user;
        const images = [];
        // if (title == undefined || description == undefined || title == "" || description == "" || title == null || description == null) {
        //   return res.status(400).json({
        //     success: false,
        //     message: "Title and Description are required",
        //   });
        // }
        imageLocation = "";
        videoLocaiton = "";

        if (files.image) {
            const file = files.image[0];
            const fileName = file.originalname;
            const fileContent = file.buffer;
            imageLocation = await uploadFileWithFolder(
                fileName,
                "newsFeed",
                fileContent
            );
        }


        if (files.video) {
            const file = files.video[0];
            const fileName = file.originalname;
            const fileContent = file.buffer;
            videoLocaiton = await uploadFileWithFolder(
                fileName,
                "newsFeed",
                fileContent
               );
        }
         

        //status create
        const status = await Status.create({
            statusText: text,
            statusImage: imageLocation,
            statusVideo: videoLocaiton,
            createdBy: user_id
        });
        console.log(status)

         //highlight create
        const highlight=await Highlights.create({
            highlightText:text,
            highlightImage:imageLocation,
            highlightVideo:videoLocaiton,
            createdBy:user_id
        })


        console.log(highlight);
        res.status(200).json({
            success: true,
            message: "Status Added Successfully",
            data: status,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

const getStatus = async (req, res) => {
    try {

        const statuses = await Status.find({ createdAt: { $gte: moment().subtract(1, 'day').toDate() } }).populate('createdBy');
        const formattedStatuses = statuses.map(status => ({
            statusText: status.statusText,
            statusImage: status.statusImage,
            statusVideo: status.statusVideo,
            createdBy: status.createdBy,
            createdAt: moment(status.createdAt).format('YYYY-MM-DD HH:mm:ss')
        }));
        res.send(formattedStatuses);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

const getRatingAverage=async(req,res)=>{
    try {        
        
    const posts = await newsFeedModel.find().populate(
    
        [

            {
                path: "rating",
                model: "ratingNewsFeed",
              },
              {
                path: "createdBy",
                model: "users",
              },
        ]
    );

    if (posts.length === 0) {
      return res.json({ averageRating: 0, postCount: 0 });
    }

    let totalRating = 0;
    let postCount = 0;

    posts.forEach(post => {
      const ratings = post.rating;
      if (ratings.length > 0) {
        const ratingSum = ratings.reduce((sum, rating) => sum + rating.rating, 0);
        totalRating += ratingSum;
        postCount++;
      }
    });

    const averageRating = totalRating / postCount;
    res.json({averageRating, postCount });
    // res.status(200).json({
    //     success:true,
    //     message:"average rating found",
    //     data:[averageRating,postCount]
    // })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success:false,
            error:error.message
        })
    }
}




module.exports = {
    createStatus: [uploadOptions.fields([{
        name: 'image', maxCount: 1
    }, {
        name: 'video', maxCount: 1
    }]), createStatus],
    getStatus,
    getRatingAverage

};
