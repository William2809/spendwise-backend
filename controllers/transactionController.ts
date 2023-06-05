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
          content: `We have a list of categories: ${categories.join(", ")}.`
        },
        {
          role: "user",
          content: text
        },
        {
          role: "assistant",
          content: `Please classify the expense into one of the categories and generate a JSON object with the following fields: \n1. name (the name of the establishment)\n2. item (the item purchased)\n3. category (the best fitting category from the list)\n4. amount (the amount spent)\n\nJSON:`
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
