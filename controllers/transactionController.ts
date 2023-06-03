import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Transaction from '../models/transactionModel';
import mongoose from 'mongoose';
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

export{
    addTransaction,
    getTransaction
}