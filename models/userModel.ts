import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
		},
		email: {
			type: String,
			required: [true, "Please enter your email"],
		},
		picture: {
			type: String,
		},
		password: {
			type: String,
		},
		weeklyBudget: {
			type: Number,
		},
		weeklyPrediction: {
			type: Array<number>,
		},
	},
	{
		timestamps: true,
	}
);

export default mongoose.model("User", userSchema);
