import mongoose from 'mongoose';



const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please provide a username"],
    unique: [true, "username is not unique"]

  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
  },
  fullName: {
    type: String,
    required: [true, "Please provide your full name"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
  },
  forgetPasswordToken: {
    type: String,
    default:null
  },
  forgetPasswordTokenExpiry: {
    type: Date,
    default:null
  },
  stories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Stories"
  }],
  subscribers: {
    type: Number,
    default: 0
  },
  subscriptions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  liked: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Videos",
  }],

  isVerified: {
    type: Boolean,
    default: false
  },
  playlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Playlist",
  }],
  uploadedVideos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Videos",
  }],
  triggerWatchHistory: {
    type: Boolean,
    default: true
  },
  watchHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Videos",
  }],
  watchLater: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Videos",
  }],
  avatar: {
    type: String,
  },
  group: [
    {
      avatar: String,
      username: String,
      _id: String,
      groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat"
      },
      members: []
    }
  ],
  status: { type: String, enum: ['online', 'offline'], default: 'offline' },
  chatfrnd: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  newMsgNotificationDot: [{
    Id: mongoose.Schema.Types.ObjectId,
    count: { type: Number, default: 0 }
  }],
  isMyChatOpen: { type: String },
  notifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Notifications",
  }],
  isNewNotification: [],
  isNotificationBoxOpen: {
    type: Boolean,
    default: false
  },

  requests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }

  ],

  myrequests: [],

  coverImage: {
    type: String,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  forgetPasswordToken: String,
  forgetPasswordTokenExpiry: Date,
  isVerified: {
    type: Boolean,
    default: false,
  },
  verifyCode: {
    type: String,
  },
  verifyCodeExpiry: {
    type: Date,
  },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
