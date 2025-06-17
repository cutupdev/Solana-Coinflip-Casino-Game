import mongoose from "mongoose";

const historySchema = new mongoose.Schema(
    {
        address: String,
        signature: String,
        type: Number,
        bet_amount: Number,
        block_hash: Number,
        win: Number,
    },
    {
        timestamps: {
            createdAt: "created_at", // Use `created_at` to store the created date
            updatedAt: "updated_at", // and `updated_at` to store the last updated date
        },
    }
);

export const historyModel = mongoose.model("history", historySchema);
