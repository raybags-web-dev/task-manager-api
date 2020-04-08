const _ = require('underscore');
const validateObjectId = require('../../middleware/validateObjectid');
const express = require('express');
const router = express.Router();

const { Tasks } = require('../models/taskModel');
const { auth } = require('../../middleware/auth');
const { async_errors } = require('../../middleware/errorHandler');

//query strings.

//GET /tasks?completed=true
//GET /tasks?limit=10$skip=20
//GET /tasks?sortBy=createdAt_desc OR /tasks?sortBy=createdAt_asc

router.get('/tasks/', auth, async_errors(async (req, res) => {
   if (req.user == null) return res.status(500).send('you are trying to get tasks for a user that does not exist');

   const match = {};
   const sort = {};

   if (req.query.completed) {
      match.completed = req.query.completed === 'true'
   }

   if (req.query.sortBy) {
      const parts = req.query.sortBy.split('_')
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
   }

   await req.user.populate({
      path: 'tasks',
      select: ['completed', 'description', 'createdAt', 'updatedAt', '-owner'],
      match,
      options: {
         sort,
         limit: parseInt(req.query.limit),
         skip: parseInt(req.query.skip)
      }
   }).execPopulate();

   if (!req.user.tasks) return res.status(404).send('No tasks were found !!');
   if (req.user.tasks.length === 0) return res.send('Oops end of the line...refine your search')

   res.send(req.user.tasks);
}));

router.get('/tasks/:id', auth, validateObjectId, async_errors(async (req, res) => {

   const _id = req.params.id;
   const task = await Tasks.findOne({ _id, owner: req.user._id });

   if (!task) return res.status(404).send('could not find this task');

   res.status(202).send(task);

}));

router.put('/tasks/:id', auth, validateObjectId, async_errors(async (req, res) => {

   const updates = Object.keys(req.body);
   const allowedupdates = ['description', 'completed'];
   const isValidUpdates = updates.every((update) => allowedupdates.includes(update));
   if (!isValidUpdates) return res.status(400).send('Error: Invalid task update fields detected!');

   const task = await Tasks.findOne({ _id: req.params.id, owner: req.user._id });
   if (!task) return res.status(404).send('This task could not be found!');

   allowedupdates.forEach(update => task[update] = req.body[update]);
   await task.save();

   res.status(202).send(_.pick(task, ['description', 'completed']));

}));

router.patch('/tasks/all_completed', auth, async_errors(async (req, res) => {
   let tasks = await Tasks.updateMany({ completed: false, owner: req.user._id }, { completed: true });

   if (tasks.n == 0) return res.status(404).send(`No tasks to be updated`);
   if (tasks.n != 0 && tasks.nModified == 0) return res.status(401).send(`Field value and query value should be different! Try again.`)

   res.send(`[${tasks.n}]-task(s), where found. [${tasks.nModified}] tasks where modified. status_code: ${tasks.ok}`);

}))

router.post('/tasks', auth, async_errors(async (req, res) => {
   const task = new Tasks({
      ...req.body,
      owner: req.user._id
   });

   if (!req.body.description) return res.status(400).send('decription is required!!');

   task.save();

   let totalCount = await Tasks.countDocuments();

   res.status(201).send({ task, totalCount });
}));

router.delete('/tasks/:id', auth, validateObjectId, async_errors(async (req, res) => {

   let task = await Tasks.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
   if (!task) return res.status(404).send(`task could not be found!`);

   let remaining = await Tasks.find({ completed: false }).countDocuments();
   let total = await Tasks.countDocuments();

   res.status(202).send(`task deleted. incomplete tasks = ${remaining}. total count = ${total}`);

}));



exports.task_router = router;