import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Transaction from '../models/transactionModel';
import mongoose from 'mongoose';
import axios from 'axios';
interface RequestWithUser extends Request {
    user: mongoose.Document | null;
}

// Desc: add a transaction
// Route : /api/transactions/add
// access : public
const addTransaction = asyncHandler(async (req: Request, res: Response) => {    
    const {name, item, category, amount} = req.body;
    //Create transaction
    await Transaction.create({
        name: name,
        item: item,
        category: category,
        amount: amount,
        userId: (req as RequestWithUser).user?._id
    });
    res.json({message: "Successfully added!"});
}); 

// Desc: get transactions
// Route : /api/transactions/get
// access : private
const getTransaction = asyncHandler(async (req: Request, res: Response) => {    
    //get all transactions
    const transactions = await Transaction.find({userId: (req as RequestWithUser).user?._id});

    // Send transactions in response
    res.json(transactions);
}); 

// Desc: classify transactions
// Route : /api/transactions/classify
// access : private
const classifyTransaction = asyncHandler(async (req: Request, res: Response) => {    
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
    "Miscellaneous"
  ];

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
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
          `
        },
        {
          role: "user",
          content: text
        },
        {
          role: "assistant",
          content: `

          Please classify the expense into one of the categories and generate a JSON object with the following fields (Use capitalize format): \n1. name (2 words or more of summarization with clear action context of the text and establishment's name, if it is not about expenses or spending, fill it as "Unknown")\n2. item (the item purchased)\n3. category (the best fitting category from the list)\n4. amount (the amount spent, just number do not include currency character )\n\nJSON:`
        }
      ],
      temperature: 0.3,
      max_tokens: 60,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const result = response.data.choices[0].message.content.trim().split('\n');


    // Parse the result to fit into your desired JSON format

    const parsedResult = JSON.parse(result.join(''));

    res.json(parsedResult);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error in OpenAI API call');
  }
}); 

export{
    addTransaction,
    getTransaction,
    classifyTransaction
}
