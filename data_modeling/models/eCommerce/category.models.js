import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        description: {
            type: String,
            trim: true,
        },
        image: {
            type: String, // Can store image URL or path
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }, 
)

export const Category = mongoose.model('Category', categorySchema)


