import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel";
import dotenv from "dotenv";
import { RequestWithUser } from "./transactionController";
dotenv.config();

//Generate token
const generateToken = (id: any) => {
	return jwt.sign({ id }, process.env.JWT_SECRET as string, {
		expiresIn: "60d",
	});
};

// Desc: Login a user
// Route : /api/users/
// access : public
const loginUser = asyncHandler(async (req: Request, res: Response) => {
	const { email, password } = req.body;

	//Check if username/email is in the database
	const user = await User.findOne({ email: email });
	if (
		user &&
		(await bcrypt.compare(password as string, user.password as string))
	) {
		res.status(200).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			picture: user.picture,
			weeklyBudget: user.weeklyBudget,
			token: generateToken(user._id),
		});
	} else {
		res.status(401).json({ message: "Invalid Credentials" });
	}
});

// Desc: Register a new user
// Route : /api/users/register
// access : public
const registerUser = asyncHandler(async (req: Request, res: Response) => {
	const { name, email, password } = req.body;

	if (!name || !email || !password) {
		res.status(400).json({ message: "Please include all fields!" });
	}

	//Find if email is already used
	const userExists = await User.findOne({ email: email });
	if (userExists) {
		res.status(400).json({ message: "Email is not available." });
		throw new Error("Email is not available.");
	}

	//Hash the password
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(password, salt);

	// Create user
	const user = await User.create({
		name,
		email: email.toLowerCase(),
		password: hashedPassword,
	});

	if (user) {
		res.status(201).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			picture: user.picture,
			weeklyBudget: user.weeklyBudget,
			token: generateToken(user._id),
		});
	}
});

// desc:   Register/Login user via google oauth
// route: /api/users/googlesignin
// access: public
const googleSignIn = asyncHandler(
	async (
		req: {
			body: {
				name: String;
				email: String;
				picture: String;
			};
		},
		res: any
	) => {
		const { name, email, picture } = req.body; //get data from request

		const userExist = await User.findOne({ email: email });
		if (userExist) {
			res.status(200).json({
				_id: userExist._id,
				name: userExist.name,
				email: userExist.email,
				picture: userExist.picture,
				weeklyBudget: userExist.weeklyBudget,
				token: generateToken(userExist._id),
			});
		} else {
			//Create user
			const user = await User.create({
				name,
				email: email.toLowerCase(),
				picture,
			});

			if (user) {
				res.status(201).json({
					_id: user._id,
					name: user.name,
					email: user.email,
					picture: user.picture,
					weeklyBudget: user.weeklyBudget,
					token: generateToken(user._id),
				});
			}
		}
	}
);

// desc:   Check if user has a password
// route: /api/users/checkpassword
// access: private
const checkPassword = asyncHandler(async (req: Request, res: Response) => {
	const { email } = req.body;

	//Check if username/email is in the database
	const user = await User.findOne({ email: email });
	if (user && user.password) {
		res.status(200).json({
			status: true,
		});
	} else {
		res.status(200).json({
			status: false,
		});
	}
});

// desc:  set new password or change password
// route: /api/users/setpassword
// access: private
const setPassword = asyncHandler(async (req: Request, res: Response) => {
	const { email, newPassword, currentPassword } = req.body;
	//Check if username/email is in the database
	const user = await User.findOne({ email: email });

	// Verify the current password if both newPassword and currentPassword are provided
	if (newPassword && currentPassword) {
		if (
			user &&
			(await bcrypt.compare(currentPassword, user.password as string))
		) {
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(newPassword, salt);

			user.password = hashedPassword;
			await user.save();
			res.status(200).json({ message: "Password updated successfully" });
		} else {
			res.status(400).json({ message: "Invalid password" });
		}
	} else if (user) {
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(newPassword, salt);
		user.password = hashedPassword;
		await user.save();
		res.status(200).json({ message: "Password updated successfully" });
	}
});

const setWeeklyBudget = asyncHandler(async (req: Request, res: Response) => {
	const { weeklyBudget } = req.body;

	const user = await User.findById((req as RequestWithUser).user?._id);

	if (user) {
		user.weeklyBudget = weeklyBudget;
		await user.save();
		res.status(200).json({ message: "Weekly budget is successfully updated" });
	}
});

const getWeeklyBudget = asyncHandler(async (req: Request, res: Response) => {
	const user: any = await User.findById((req as RequestWithUser).user?._id);

	res.status(200).json({ weeklyBudget: user.weeklyBudget });
});

const savePrediction = asyncHandler(async (req: Request, res: Response) => {
	const { weeklyPrediction } = req.body;
	const user = await User.findById((req as RequestWithUser).user?._id);

	// console.log(weeklyPrediction);

	if (user) {
		user.weeklyPrediction = weeklyPrediction;
		await user.save();
		res
			.status(200)
			.json({ message: "Weekly prediction is successfully updated" });
	}
});

const getWeeklyPrediction = asyncHandler(
	async (req: Request, res: Response) => {
		const user = await User.findById((req as RequestWithUser).user?._id);

		res.status(200).json({ weeklyPrediction: user?.weeklyPrediction });
	}
);

export {
	registerUser,
	loginUser,
	googleSignIn,
	checkPassword,
	setPassword,
	setWeeklyBudget,
	getWeeklyBudget,
	savePrediction,
	getWeeklyPrediction,
};
