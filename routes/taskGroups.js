const router = require("express").Router();
const taskGroupController = require('../controllers/taskGroupController');
const authMiddleware = require("../middlewares/authMiddleware");

router
    .route('/task-groups')
    .post(authMiddleware, (req, res) => taskGroupController.createTaskGroup(req, res));

router
    .route('/task-groups/:groupId')
    .put(authMiddleware, (req,res) => taskGroupController.updateTaskGroup(req,res));

router
    .route('/task-groups/:groupId/members')
    .post(authMiddleware, (req, res) => taskGroupController.addMemberToTaskGroup(req, res));

router
    .route('/task-groups')
    .get(authMiddleware, (req,res) => taskGroupController.getAllTaskGroup(req,res));

router
    .route('/task-groups/:groupId')
    .delete(authMiddleware, (req, res) => taskGroupController.deleteTaskGroup(req, res));



module.exports = router;