const router = require("express").Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require("../middlewares/authMiddleware");

// Criar Tarefa
router
    .route('/tasks')
    .post(authMiddleware, (req, res) => taskController.createTask(req, res));

//Atualizar tarefa
router
    .route('/tasks/:id')
    .put(authMiddleware, (req, res) => taskController.updateTask(req, res));

//Atribuir tarefa a um usuario
router
    .route('/tasks/assign')
    .patch(authMiddleware, (req, res) => taskController.assignTask(req, res))

//Buscar TODAS tarefas do usuario sem filtro
router
    .route("/tasks")
    .get(authMiddleware,(req,res) => taskController.getAllTasks(req,res));

//Buscar TODAS tarefas do usuario com filtro de prioridade de data e nao concluidos
router
    .route("/tasks/status")
    .get(authMiddleware,(req,res) => taskController.getTasksByStatus(req,res));

// Buscar TODAS tarefas de determinada prioridade ""alta", "média", "baixa""
router
    .route("/tasks/priority")
    .get(authMiddleware,(req,res) => taskController.getTasksByPriority(req,res));

//Deletar tarefa
router
    .route("/tasks/:taskId")
    .delete(authMiddleware,(req,res) => taskController.deleteTask(req,res));

// buscar tarefa por id ou nome ? ??

module.exports = router;
