const mongoose = require('mongoose');

const taskGroupMemberSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    taskGroup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TaskGroup',
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'editor', 'viewer'],
        required: true
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

const TaskGroupMember = mongoose.model('TaskGroupMember', taskGroupMemberSchema);

module.exports = {
    TaskGroupMember,
    taskGroupMemberSchema,
}
