const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        lowercase: true,
    },
    description: {
        type: String,
        lowercase: true,
    },
    status: { 
        type: String,
        enum: ["pendente", "andamento", "concluida"],
        default: "pendente"
    },
    dueDate: {
        type: Date
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true 
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User" 
    },
    taskGroupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TaskGroup",
        default: null 
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    priority: { 
        type: String, enum: ["alta", "media", "baixa"],
        default: "media" },
});

const Task = mongoose.model('Task', taskSchema);

module.exports = {
    Task,
    taskSchema,
}