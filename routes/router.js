const router = require('express').Router();


const userRouter = require('./users');
const taskRouter = require('./tasks');
const taskGroupRouter = require('./taskGroups');

router.use('/', userRouter);
router.use('/', taskRouter);
router.use('/', taskGroupRouter);

module.exports = router;