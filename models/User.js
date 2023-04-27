const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please choose a username"],
    unique: true,
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    validate: [validator.isEmail, "Please provide valid email"]
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    select: false,
    minlength: [8, "Please choose a valid password"],
  },
  age: {
    type: Number,
    min: [15, "Please provide valid age"]
  },
  gender: {
    type: String
  },
  phone: {
    type: String,
    unique: true,
    validate: [validator.isMobilePhone, "Please provide valid mobile number."]
  },
  avatar: {
    public_id: {
      type: String,
      required: true,
      default: "avatars/user_c1xesh"
    },
    url: {
      type: String,
      required: true,
      default: "https://res.cloudinary.com/dfahmk4ht/image/upload/v1681826812/avatars/user_c1xesh.png"
    },
  },
  college: {
    type: String,
    minlength: [10, "Please provide a college name"],
  },
  course: {
    type: String
  },
  city: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    },
    label: {
      type: String,
      required: true
    }
  },
  role: {
    type: String,
    default: "user"
  },
  interests: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Topic",
        required: true
      },
      label: {
        type: String,
        required: true
      }
    }
  ],
  skills: [{ type: String }],
  links: {
    type: [{
      platform: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true
      },
      _id: false
    }]
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
},
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
})

userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  })
}

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
}

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000

  return resetToken;
}

const User = mongoose.model("User", userSchema);
module.exports = User;
