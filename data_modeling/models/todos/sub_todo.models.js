import mongoose from "mongoose";

const subTodoSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    complete: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})


export const SubTodo = mongoose.model('SubTodo', subTodoSchema)