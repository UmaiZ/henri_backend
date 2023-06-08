const mongoose=require('mongoose');

const channelSchema=new mongoose.Schema({



 
     channelName: {
        type: String,
      },
      uid: {
        type: String,
        type: mongoose.Schema.Types.ObjectId,
        ref:"users"
      },
      role: {
        type: String,
        enum: ['publisher', 'subscriber'],
        default: 'publisher',
      },
      token:{
        type:String
      }


    
});


const channelModel=mongoose.model('channels',channelSchema);

module.exports=channelModel;