import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
    },
    item: {
        type: String,
    },
    category: {
        type: String,
    },
    amount: {
        type: Number,
    },
},
    {
        timestamps: true,
    })

export default mongoose.model('Transaction', transactionSchema);
