import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxLength: 32,
        },
        description: {
            type: String,
            required: true,
            trim: true,
            maxLength: 2000,
        },
        price: {
            type: Number,
            required: true,
            maxLength: 32,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
        },
        stock: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        image: {
            type: String,
            default: '',
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        reviews: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true,
                },
                rating: {
                    type: Number,
                    required: true,
                    min: 0,
                    max: 5,
                },
                comment: {
                    type: String,
                    required: true,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    { timestamps: true },
)

export const Product = mongoose.model("Product", productSchema)