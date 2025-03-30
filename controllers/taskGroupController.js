const TaskGroup = require('../models/TaskGroup');
const { TaskGroupMember } = require('../models/TaskGroupMember');
const {User : UserModel, User} = require("../models/user");
const jwt = require('jsonwebtoken');


const taskGroupController = {
    createTaskGroup: async (req,res) => {
        const token = req.headers.authorization?.split(' ')[1];
                    if (!token) {
                        return res.status(401).json({ msg: 'Token de autenticação não fornecido.' });
                    }
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    const userId = decoded.userId;
                    const user = await User.findById(userId);

        
        try {

        const { name, description } = req.body;
        

        if (!name) {
            return res.status(400).json({ msg: 'O nome do grupo é obrigatório.' });
        }

        const taskGroup = new TaskGroup({
            name,
            description,
            createdBy: userId,
            members: [{ user: userId, role: 'admin' }],
        });

        await taskGroup.save();

        const taskGroupMember = new TaskGroupMember({
            user: userId,
            taskGroup: taskGroup._id,
            role: 'admin',
        });
        await taskGroupMember.save();

        res.status(201).json({ msg: 'Grupo criado com sucesso.', taskGroup });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Erro ao criar o grupo.', error: error.message });
    }

    },
    updateTaskGroup: async (req,res) =>{
        const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({ msg: 'Token de autenticação não fornecido.' });
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.userId;
            const user = await User.findById(userId);
            try {
                const { groupId } = req.params; 
                const { name, description } = req.body; 
                
                const group = await TaskGroup.findById(groupId);
                if (!group) {
                    return res.status(404).json({ msg: "Grupo não encontrado." });
                }
                
                const member = await TaskGroupMember.findOne({ user: userId, taskGroup: groupId });
                const isAllowed = group.createdBy.toString() === userId || (member && ["admin", "editor"].includes(member.role));
                
                if (!isAllowed) {
                    return res.status(403).json({ msg: "Você não tem permissão para editar este grupo." });
                }
                
                if (name) group.name = name;
                if (description) group.description = description;
                
                await group.save();
                
                res.status(200).json({ msg: "Grupo atualizado com sucesso.", group });
            } catch (error) {
                console.error("Erro ao atualizar o grupo:", error);
                res.status(500).json({ msg: "Erro ao atualizar o grupo.", error: error.message });
            }
    },
    addMemberToTaskGroup: async (req,res) =>{
        const token = req.headers.authorization?.split(' ')[1];
                    if (!token) {
                        return res.status(401).json({ msg: 'Token de autenticação não fornecido.' });
                    }
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    const userId = decoded.userId;
                    const user = await User.findById(userId);
                    try {
                        const { email, role } = req.body;
                        const { groupId } = req.params;
                
                        const taskGroup = await TaskGroup.findById(groupId);
                        if (!taskGroup) {
                            return res.status(404).json({ msg: "Grupo de tarefas não encontrado." });
                        }
                
                        if (taskGroup.createdBy.toString() !== userId) {
                            return res.status(403).json({ msg: "Apenas o criador do grupo pode adicionar membros." });
                        }
                
                        const userToAdd = await User.findOne({ email });
                        if (!userToAdd) {
                            return res.status(404).json({ msg: "Usuário não encontrado." });
                        }
                
                        const isAlreadyMember = taskGroup.members.some(member => member.user.toString() === userToAdd._id.toString());
                        if (isAlreadyMember) {
                            return res.status(400).json({ msg: "Usuário já faz parte do grupo." });
                        }
                
                        const memberRole = role || "viewer";
                
                        taskGroup.members.push({ user: userToAdd._id, role: memberRole });
                        await taskGroup.save();
                
                        res.status(200).json({ msg: "Membro adicionado com sucesso!", taskGroup });
                    } catch (error) {
                        console.error("Erro ao adicionar membro ao grupo:", error);
                        res.status(500).json({ msg: "Erro ao adicionar membro ao grupo.", error: error.message });
                    }
        

    },
    getAllTaskGroup: async (req,res) => {
        token = req.headers.authorization?.split(' ')[1];
                    if (!token) {
                        return res.status(401).json({ msg: 'Token de autenticação não fornecido.' });
                    }
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    const userId = decoded.userId;
                    try {
                        const created = req.query.created === "true"; // Converte para booleano
                        const member = req.query.member === "true"; // Converte para booleano
                
                        let query = [];
                
                        if (created) {
                            query.push({ createdBy: userId });
                        }
                
                        if (member) {
                            query.push({ "members.user": userId });
                        }
                
                        // Se nenhum filtro for passado, busca ambos
                        if (query.length === 0) {
                            query.push({ createdBy: userId }, { "members.user": userId });
                        }
                
                        // Buscar os grupos com os filtros aplicados
                        const allGroups = await TaskGroup.find({ $or: query });

                        res.status(200).json(allGroups);
                    } catch (error) {
                        console.error("Erro ao buscar grupos de tarefas:", error);
                        res.status(500).json({ msg: "Erro ao buscar grupos de tarefas.", error: error.message });
                    }
        
    },
    deleteTaskGroup: async (req,res) => {
        token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ msg: 'Token de autenticação não fornecido.' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        try {
            const { groupId } = req.params; 

            const group = await TaskGroup.findById(groupId);
            if (!group) {
                return res.status(404).json({ msg: "Grupo não encontrado." });
            }
    
            const isAdmin = group.createdBy.toString() === userId;
            if (!isAdmin) {
                return res.status(403).json({ msg: "Apenas Admins do grupo podem excluí-lo." });
            }
    
            await TaskGroupMember.deleteMany({ taskGroup: groupId });
    
            await TaskGroup.findByIdAndDelete(groupId);
    
            res.status(200).json({ msg: "Grupo excluído com sucesso." });
        } catch (error) {
            console.error("Erro ao deletar o grupo:", error);
            res.status(500).json({ msg: "Erro ao deletar o grupo.", error: error.message });
        }
    },
};

module.exports = taskGroupController;