const mongoose = require('mongoose');

const taskGroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    members: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            role: { type: String, enum: ["admin", "editor", "viewer"], default: "viewer" }
        }
    ],
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const TaskGroup = mongoose.model('TaskGroup', taskGroupSchema);

module.exports = TaskGroup;