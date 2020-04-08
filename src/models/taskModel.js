const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
   description: {
      type: String,
      createIndexes: true,
      trim: true,
      minlegth: 3,
      maxlength: 50,
      required: true,
      validate(value) {
         if (value.length < 3) throw new Error('min length can not be below 3');
      }
   },
   completed: {
      type: Boolean,
      default: false,
      required: true,
   },
   owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
   }
},
   {
      timestamps: true
   });

taskSchema.methods.toJSON = function () {
   const tasks = this;
   const taskObject = tasks.toObject()

   delete taskObject._v
   delete taskObject._id

   return taskObject;
}

const Tasks = mongoose.model('Tasks', taskSchema);
exports.Tasks = Tasks;
