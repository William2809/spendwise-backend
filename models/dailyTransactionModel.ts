import mongoose from "mongoose";

const dailyTransactionSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		numberOfDay: {
			type: Number,
		},
		amount: {
			type: Number,
		},
		date: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: true,
	}
);

export default mongoose.model("dailyTransaction", dailyTransactionSchema);
