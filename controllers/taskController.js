const { Task : TaskModel, Task } = require('../models/Task');
const { TaskGroup } = require('../models/TaskGroup');
const {User : UserModel, User} = require("../models/user");
const jwt = require('jsonwebtoken');

const taskController = {

    createTask: async (req, res) => {
        try {
            //console.log('Dados recebidos no corpo:', req.body);
    
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({ msg: 'Token de autenticação não fornecido.' });
            }
    
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.userId;
    
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ msg: 'Usuário não encontrado.' });
            }
    
            const { title, description, dueDate, taskGroup, priority, status } = req.body;
    
            if (!title) {
                return res.status(400).json({ msg: 'Título da tarefa é obrigatório.' });
            }
    
            const taskData = {
                title,
                description,
                dueDate,
                status: status || "pendente",
                priority: priority || "media",
                createdBy: userId,
                taskGroup: taskGroup === "" ? null : taskGroup,
            };
    
            const newTask = new Task(taskData);
            await newTask.save();
    
            res.status(201).json({ msg: 'Tarefa criada com sucesso', task: newTask });
    
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: 'Erro ao criar tarefa.' });
        }
    },
    updateTask: async (req, res) => {

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ msg: 'Token de autenticação não fornecido.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const { id } = req.params; 
        const { title, description, status, dueDate, assignedTo } = req.body;
        const userId = decoded.userId; 


    if (!userId) {
        return res.status(401).json({ msg: "Usuário não autenticado." });
    }

    try {
        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ msg: "Tarefa não encontrada." });
        }

        if (task.createdBy.toString() !== userId) {
            return res.status(403).json({ msg: "Apenas o criador da tarefa pode editá-la." });
        }

        if (title !== undefined && (!title.trim() || title.length < 3)) {
            return res.status(400).json({ msg: "O título da tarefa deve ter pelo menos 3 caracteres." });
        }

        if (title) task.title = title;
        if (description) task.description = description;
        if (status) task.status = status;
        if (dueDate) task.dueDate = dueDate;
        if (assignedTo) task.assignedTo = assignedTo;

        await task.save();

        res.status(200).json({ task, msg: "Tarefa atualizada com sucesso." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao atualizar a tarefa", error: error.message });
    }
    },
    assignTask: async (req,res) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ msg: 'Token de autenticação não fornecido.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const userId = decoded.userId;
        const { taskId, email } = req.body;

        if (!userId) {
            return res.status(401).json({ msg: "Usuário não autenticado." });
        }
    
        try {
            const task = await Task.findById(taskId);
            if (!task) {
                return res.status(404).json({ msg: "Tarefa não encontrada." });
            }
    
            if (task.createdBy.toString() !== userId) {
                return res.status(403).json({ msg: "Apenas o criador da tarefa pode atribuí-la." });
            }
    
            const userToAssign = await User.findOne({ email });
            if (!userToAssign) {
                return res.status(404).json({ msg: "Usuário não encontrado." });
            }
    
            task.assignedTo = userToAssign._id;
            await task.save();
    
            res.status(200).json({ msg: "Tarefa atribuída com sucesso.", task });
    
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: "Erro ao atribuir tarefa.", error: error.message });
        }

    },
    getAllTasks: async (req, res) => {

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ msg: 'Token de autenticação não fornecido.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const userId = decoded.userId; 

    
    
        if (!userId) {
            return res.status(401).json({ msg: "Usuário não autenticado." });
        }
    
        try {
            // Busca todas as tarefas criadas pelo usuário autenticado
            const tasks = await Task.find({ createdBy: userId }).populate("assignedTo", "name email");
    
            if (!tasks.length) {
                return res.status(404).json({ msg: "Nenhuma tarefa encontrada." });
            }
    
            res.status(200).json(tasks);
    
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: "Erro ao buscar as tarefas", error: error.message });
        }
    },
    getTasksByStatus: async (req,res) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ msg: 'Token de autenticação não fornecido.' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const userId = decoded.userId; 
        const { status } = req.query;

        try {
            // Criamos um filtro baseado no status passado (se existir)
            const filter = { createdBy: userId };
            if (status) {
                // Valida se o status é um dos valores válidos
                if (!["pendente", "andamento", "concluida"].includes(status)) {
                    return res.status(400).json({ msg: "Status inválido." });
                }
                filter.status = status; // Filtra pelo status
            }
    
            // Buscamos as tarefas e ordenamos pela dueDate (data de vencimento)
            const tasks = await Task.find(filter)
                .sort({ dueDate: 1 })  // Ordena pela dueDate (mais próxima primeiro)
                .lean();  // Utiliza o método lean() para obter documentos mais simples
    
            res.status(200).json(tasks);
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: "Erro ao buscar tarefas.", error: error.message });
        }

    },
    getTasksByPriority: async (req,res) =>{
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ msg: 'Token de autenticação não fornecido.' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const userId = decoded.userId; 
        const { priority } = req.query;
        try {
            const filter = { createdBy: userId };
            if (priority) {
                if (!["alta", "media", "baixa"].includes(priority)) {
                    return res.status(400).json({ msg: "Prioridade inválida." });
                }
                filter.priority = priority;
            }
    
            const priorityOrder = {
                alta: 1,   
                media: 2,  
                baixa: 3    
            };
    
            const tasks = await Task.find(filter)
                .sort({ priority: 1 })  
                .lean();  
            res.status(200).json(tasks);
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: "Erro ao buscar tarefas.", error: error.message });
        }
    },
    deleteTask: async (req,res) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ msg: 'Token de autenticação não fornecido.' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const userId = decoded.userId; 
        const { taskId } = req.params;

        try {
            // Busca a tarefa pelo ID
            const task = await Task.findById(taskId);
    
            if (!task) {
                return res.status(404).json({ msg: "Tarefa não encontrada." });
            }
    
            // Verifica se o usuário autenticado é o criador da tarefa
            if (task.createdBy.toString() !== userId) {
                return res.status(403).json({ msg: "Apenas o criador da tarefa pode excluí-la." });
            }
    
            // Exclui a tarefa
            await Task.findByIdAndDelete(taskId);
    
            res.status(200).json({ msg: "Tarefa excluída com sucesso." });
    
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: "Erro ao excluir a tarefa", error: error.message });
        }
    },

};

module.exports = taskController;