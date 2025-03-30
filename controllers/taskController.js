const { Task : TaskModel, Task } = require('../models/Task');
const TaskGroup = require('../models/TaskGroup');
const {User : UserModel, User} = require("../models/user");
const jwt = require('jsonwebtoken');

const taskController = {

    createTask: async (req, res) => {
                 // Extrair token de autorização
                 const token = req.headers.authorization?.split(' ')[1];
                 if (!token) {
                     return res.status(401).json({ msg: 'Token de autenticação não fornecido.' });
                 }
         
                 // Decodificar o token JWT
                 const decoded = jwt.verify(token, process.env.JWT_SECRET);
                 const userId = decoded.userId;
         
                 // Verificar se o usuário existe
                 const user = await User.findById(userId);
    
                 if (!user) {
                     return res.status(404).json({ msg: 'Usuário não encontrado.' });
                 }
         
        
        try {
   
            // Desestruturar os dados recebidos no corpo da requisição
            const { title, description, dueDate, taskGroupId, priority, status } = req.body;
            console.log(taskGroupId);
            // Verificar se o título foi fornecido
            if (!title) {
                return res.status(400).json({ msg: 'Título da tarefa é obrigatório.' });
            }
    
            // Dados para criar a tarefa
            const taskData = {
                title,
                description,
                dueDate,
                status: status || "pendente",
                priority: priority || "media",
                createdBy: userId,
                taskGroupId: taskGroupId === "" ? null : taskGroupId, // Aqui utilizamos taskGroupId
            };
    
            // Criar a tarefa
            const newTask = await Task.create(taskData);
            await newTask.save();
            // Se taskGroupId foi fornecido, associar a tarefa ao grupo
            if (taskGroupId) {
                const group = await TaskGroup.findById(taskGroupId);
                if (!group) {
                    return res.status(404).json({ msg: "Grupo de tarefas não encontrado." });
                }
    
                // Adicionar a tarefa ao grupo
                group.tasks.push(newTask._id);
                await group.save();
            }
    
            // Resposta de sucesso
            res.status(201).json({ msg: "Tarefa criada com sucesso.", task: newTask });
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: 'Erro ao criar tarefa.' });
        }
    },
    updateTask: async (req, res) => {
        try {
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
    
            const { id } = req.params;
            const { title, description, dueDate, taskGroupId, priority, status } = req.body;
    
            if (!id) {
                return res.status(400).json({ msg: 'ID da tarefa é obrigatório.' });
            }
    
            // Buscar a tarefa a ser atualizada
            const task = await Task.findById(id);
            if (!task) {
                return res.status(404).json({ msg: 'Tarefa não encontrada.' });
            }
    
            // Verificar se o usuário é o criador da tarefa
            if (task.createdBy.toString() !== userId) {
                return res.status(403).json({ msg: 'Apenas o criador da tarefa pode editá-la.' });
            }
    
            let taskGroup = null;
    
            // Verificar se a tarefa já pertence a um grupo
            if (task.taskGroup) {
                const currentGroup = await TaskGroup.findById(task.taskGroup).populate('members');
                if (!currentGroup) {
                    return res.status(404).json({ msg: 'Grupo de tarefas não encontrado.' });
                }
    
                // Verificar se o usuário é admin ou editor do grupo atual
                const userIsAdminOrEditor = currentGroup.members.some(member =>
                    (member.user.toString() === userId) && (member.role === 'admin' || member.role === 'editor')
                );
    
                if (!userIsAdminOrEditor) {
                    return res.status(403).json({ msg: 'Você precisa ser admin ou editor do grupo para mover a tarefa.' });
                }
    
                // Se a tarefa pertence ao grupo atual, removemos ela deste grupo
                currentGroup.tasks = currentGroup.tasks.filter(taskId => taskId.toString() !== id);
                await currentGroup.save();
            }
    
            // Se um novo grupo for passado, associamos a tarefa a esse novo grupo
            if (taskGroupId) {
                taskGroup = await TaskGroup.findById(taskGroupId);
                if (!taskGroup) {
                    return res.status(404).json({ msg: 'Novo grupo de tarefas não encontrado.' });
                }
    
                // Adicionamos a tarefa ao novo grupo
                taskGroup.tasks.push(task._id);
                await taskGroup.save();
    
                task.taskGroup = taskGroup._id;  // Atualiza a tarefa com o novo grupo
            } else {
                task.taskGroup = null;  // Se nenhum grupo for passado, desassociamos a tarefa de qualquer grupo
            }
    
            // Atualizar os outros campos da tarefa
            task.title = title || task.title;
            task.description = description || task.description;
            task.dueDate = dueDate || task.dueDate;
            task.priority = priority || task.priority;
            task.status = status || task.status;
    
            // Salvar a tarefa com o novo grupo (se necessário) e outras atualizações
            await task.save();
    
            res.status(200).json({ msg: 'Tarefa atualizada com sucesso.', task });
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: 'Erro ao atualizar tarefa.' });
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
            const filter = { createdBy: userId };
            if (status) {
                if (!["pendente", "andamento", "concluida"].includes(status)) {
                    return res.status(400).json({ msg: "Status inválido." });
                }
                filter.status = status; // Filtra pelo status
            }
    
            const tasks = await Task.find(filter)
                .sort({ dueDate: 1 }) 
                .lean();  
                
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