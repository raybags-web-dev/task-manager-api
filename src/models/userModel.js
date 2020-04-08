const config = require('config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const mongoose = require('mongoose');
const { Tasks } = require('./taskModel');

const userSchema = new mongoose.Schema({

   first_name: {
      lowercase: true,
      trim: true,
      type: String,
      required: true,
      minlegth: 3,
      maxlength: 150,
      validate(value) {
         if (!validator.isLowercase(value)) throw new Error('charactors have to be lowercased');
      }
   },
   last_name: {
      lowercase: true,
      trim: true,
      type: String,
      required: true,
      minlegth: 3,
      maxlength: 150,
      validate(value) {
         if (!validator.isLowercase(value)) throw new Error('charactors have to be lowercased');
      }
   },

   age: {
      type: String,
      default: 0,
      get: v => Math.round(v),
      set: v => Math.round(v),
      validate(value) {
         if (value < 0) throw new Error(`Age can't be a negative number`);
      }
   },
   email: {
      lowercase: true,
      createIndexes: true,
      trim: true,
      type: String,
      required: true,
      validate(value) {
         if (!validator.isEmail(value)) {
            throw new Error('email is required');
         }
      }
   },
   phone: {
      type: String,
      required: true,
      minlegth: 5,
      maxlength: 150,
      validate(value) {
         if (value.length < 10) throw new Error('phone number is invalid');

      }
   },
   isAdmin: {
      type: Boolean,
      default: false,
   },
   password: {
      type: String,
      required: true,
      minlegth: 5,
      maxlength: 150,
      trim: true,
      validate(value) {
         if (value.includes('password')) {
            throw new Error(`Password can not contain string "password" `);
         }
         if (value.length < 5) {
            throw new Error(`Invalid minimum length! Password must have morethan 4 charactors.`);
         }
      }
   },
   tokens: [{
      token: {
         type: String,
         required: true
      }
   }],
   avatar: {
      type: Buffer
   }
},
   {
      timestamps: true
   });

//attaching a virtual task property on the user model 
userSchema.virtual('tasks', {
   ref: 'Tasks',
   localField: '_id',
   foreignField: 'owner'
})
//Startic(or model methords) methords are accessible on the model/
//while "methords" are accessible on instances OR "instance methords"

//generating auth tokens!
userSchema.methods.generateAuthToken = async function () {
   try {
      const user = this;
      const token = jwt.sign({ _id: user._id.toString() }, config.get('mail.secret_key'));

      user.tokens = user.tokens.concat({ token });
      await user.save();

      return token;

   } catch (error) {
      throw new Error(error.message);
   }
}
//generate user profile, instead of using underscore
userSchema.methods.toJSON = function () {
   const user = this;
   const userObject = user.toObject();

   delete userObject.password;
   delete userObject.tokens;
   delete userObject._id;
   delete userObject.__v
   delete userObject.avatar

   return userObject;
}
//user authentication
userSchema.statics.findByCredentials = async (email, plain_text_password) => {
   const user = await User.findOne({ email });
   if (!user) throw new Error('Invalid email or password! Unable to login**');

   const isMatch = await bcrypt.compare(plain_text_password, user.password);
   if (!isMatch) throw new Error('Invalid email or password! Unable to login...');

   return user;

}
//password hashing...
userSchema.pre('save', async function (next) {
   const user = this;

   if (user.isModified('password')) {
      user.password = await bcrypt.hash(user.password, 8);
   }
   next();
});
//delete user task when user is removed.

userSchema.pre('remove', async function (next) {
   const user = this;

   await Tasks.deleteMany({ owner: user._id });
   next()
})

const User = mongoose.model('User', userSchema);
exports.User = User;
