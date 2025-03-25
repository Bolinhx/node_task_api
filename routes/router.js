const router = require('express').Router();


const userRouter = require('./users');
const taskRouter = require('./tasks');

router.use('/', userRouter);
router.use('/', taskRouter);

module.exports = router;