import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Transaction from "../models/transactionModel";
import User from "../models/userModel";
import mongoose from "mongoose";
import axios from "axios";
import { OpenAIApi, Configuration, ChatCompletionRequestMessage } from "openai";

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY || "",
});

const openai = new OpenAIApi(configuration);

export interface RequestWithUser extends Request {
	user: mongoose.Document | null;
}

// Desc: add a transaction
// Route : /api/transactions/add
// access : private
const addTransaction = asyncHandler(async (req: Request, res: Response) => {
	const { name, item, category, amount } = req.body;
	//Create transaction
	await Transaction.create({
		name: name,
		item: item,
		category: category,
		amount: amount,
		userId: (req as RequestWithUser).user?._id,
	});
	res.json({ message: "Successfully added!" });
});

// Desc: get transactions
// Route : /api/transactions/get
// access : private
const getTransaction = asyncHandler(async (req: Request, res: Response) => {
	//get all transactions
	const transactions = await Transaction.find({
		userId: (req as RequestWithUser).user?._id,
	});

	// Send transactions in response
	res.json(transactions);
});

// Desc: classify transactions
// Route : /api/transactions/classify
// access : private
const classifyTransaction = asyncHandler(
	async (req: Request, res: Response) => {
		const { text } = req.body;

		const categories = [
			"Groceries",
			"Eating Out",
			"Transportation",
			"Utilities",
			"Rent",
			"Entertainment",
			"Healthcare",
			"Personal",
			"Clothing",
			"Electronics",
			"Education",
			"Travel",
			"Gifts & Donations",
			"Insurance",
			"Investments",
			"Miscellaneous",
		];

		try {
			const response = await axios.post(
				"https://api.openai.com/v1/chat/completions",
				{
					model: "gpt-3.5-turbo",
					messages: [
						{
							role: "system",
							content: ` 
          You are an intelligent assistant that classifies expenses into categories. Here are some rules to guide your responses:

          1. We have a list of categories: ${categories.join(", ")}.

          2. If the user's message does not contain enough information for an expense or is not related to an expense, fill it in as "Unknown" or make an educated guess based on the available information(for the following fields: Name, Category, Item) -> very important.

          3. If the input could potentially fall into multiple categories, make an educated guess based on the information available.
          
          4. If the input doesn't provide a valid amount spent, fill it in as "Unknown" or "0".
          `,
						},
						{
							role: "user",
							content: text,
						},
						{
							role: "assistant",
							content: `

          Please classify the expense into one of the categories and generate a JSON object with the following fields (Use capitalize format): \n1. name (2 words or more of summarization with clear action context of the text and establishment's name, if it is not about expenses or spending, fill it as "Unknown")\n2. item (the item purchased)\n3. category (the best fitting category from the list)\n4. amount (the amount spent, just number do not include currency character )\n\nJSON:`,
						},
					],
					temperature: 0.3,
					max_tokens: 60,
				},
				{
					headers: {
						Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
						"Content-Type": "application/json",
					},
				}
			);

			const result = response.data.choices[0].message.content
				.trim()
				.split("\n");

			// Parse the result to fit into your desired JSON format

			const parsedResult = JSON.parse(result.join(""));

			res.json(parsedResult);
		} catch (error) {
			console.error(error);
			res.status(500).send("Error in OpenAI API call");
		}
	}
);

// Desc: add a transaction
// Route : /api/transactions/delete
// access : private
const deleteTransaction = asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.body;
	try {
		//delete transaction
		await Transaction.deleteOne({ _id: id });
		res.json({ message: "Successfully deleted!" });
	} catch (err) {
		res.status(500).json({ message: err });
	}
});

// Desc: edit a transaction
// Route : /api/transactions/edit
// access : private
const editTransaction = asyncHandler(async (req: Request, res: Response) => {
	const { _id, name, item, category, amount } = req.body;
	// edit transaction
	const transaction = await Transaction.findById(_id);

	if (!transaction) {
		res.status(404);
		throw new Error("Transaction not found");
	}

	transaction.name = name;
	transaction.item = item;
	transaction.category = category;
	transaction.amount = amount;

	await transaction.save();

	res.status(200).json({ message: "Successfully updated!" });
});

// ------------------------

function isThisWeek(date: Date) {
	const now = new Date();
	const day = now.getUTCDay() || 7; // Make Sunday 7 instead of 0
	now.setUTCDate(now.getUTCDate() + 4 - day); // Get Thursday of this week
	const startOfWeek = new Date(
		Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 3)
	); // Get Monday of this week
	const endOfWeek = new Date(
		Date.UTC(
			now.getUTCFullYear(),
			now.getUTCMonth(),
			now.getUTCDate() + 3,
			23,
			59,
			59,
			999
		)
	); // Get Sunday of this week
	return date >= startOfWeek && date <= endOfWeek;
}

function isLastWeek(date: Date) {
	const now = new Date();
	const day = now.getUTCDay() || 7; // Make Sunday 7 instead of 0
	now.setUTCDate(now.getUTCDate() + 4 - day); // Get Thursday of this week
	const startOfLastWeek = new Date(
		Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 10)
	); // Get Monday of last week
	const endOfLastWeek = new Date(
		Date.UTC(
			now.getUTCFullYear(),
			now.getUTCMonth(),
			now.getUTCDate() - 4,
			23,
			59,
			59,
			999
		)
	); // Get Sunday of last week
	return date >= startOfLastWeek && date <= endOfLastWeek;
}

// Desc: get transactions
// Route : /api/transactions/twoweeks
// access : private
const getTwoWeeksTransaction = async (userId: string) => {
	//get all transactions
	const transactions = await Transaction.find({
		userId: userId,
	});

	// Filter transactions from this week and last week
	const twoWeeksTransactions = transactions.filter(
		(transaction) =>
			isLastWeek(new Date(transaction.createdAt)) ||
			isThisWeek(new Date(transaction.createdAt))
	);

	// Send transactions in response
	return twoWeeksTransactions;
};

type SpendingData = {
	userId: mongoose.Types.ObjectId;
	name?: string | undefined;
	item?: string | undefined;
	category?: string | undefined;
	amount?: number | undefined;
	createdAt: Date;
};
function convertToHumanReadableFormat(data: SpendingData[]) {
	return data.map((record) => {
		const date = new Date(record.createdAt).toLocaleDateString();
		return `On ${date}, you spent ${record.amount} yen on ${record.item} at ${record.name}. This was categorized as ${record.category}.`;
	});
}

const analyzeAndRecommend = asyncHandler(
	async (req: Request, res: Response) => {
		const userId = (req as RequestWithUser).user?._id;
		// const userId = "64739c6a258d1f14556c37e8";
		const data = await getTwoWeeksTransaction(userId);
		const text = convertToHumanReadableFormat(data);

		// Prepare the messages for the API request
		const messages: ChatCompletionRequestMessage[] = [
			{
				role: "system",
				content:
					"You are a helpful personal finance assistant for students that provides spending recommendations for students. Analyze the spending data and provide recommendations on how to save money  and improve spending habits. Consider aspects like too much spending on certain categories, reduce spending on not primary stuffs, exploring cheaper options, and find alternatives to replace too much spending. Lastly, make it concise.",
			},
			{
				role: "user",
				content: text.join("\n"),
			},
		];

		// Make the API request
		const response = await openai.createChatCompletion({
			model: "gpt-3.5-turbo",
			messages: messages,
			max_tokens: 400,
		});

		// Extract the assistant's reply from the response
		const assistantReply = response.data;

		res.status(200).json(assistantReply.choices[0].message?.content);
	}
);

// Desc: get transactions
// Route : /api/transactions/getprediction
// access : private
const getPrediction = asyncHandler(async (req: Request, res: Response) => {
	//get all transactions
	const transactions = await Transaction.find({
		userId: (req as RequestWithUser).user?._id,
	});

	const user = await User.findById((req as RequestWithUser).user?._id);

	// get today
	const currentDayOfWeek = new Date().getDay();

	const transactionsToday = transactions.filter((transaction) => {
		const transactionDayOfWeek = new Date(transaction.createdAt).getDay();
		return transactionDayOfWeek === currentDayOfWeek;
	});

	const config = {
		method: "post",
		url: process.env.ML_URL + "api/predict",
		headers: {},
		data: {
			transactions: transactionsToday,
			day: currentDayOfWeek,
			budget: user?.weeklyBudget,
		},
	};

	const response = await axios(config);
	// console.log(response.data);

	// Send transactions in response
	res.json(response.data);
});

export {
	addTransaction,
	getTransaction,
	classifyTransaction,
	deleteTransaction,
	editTransaction,
	analyzeAndRecommend,
	getPrediction,
};
