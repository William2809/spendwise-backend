import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel';
import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';

interface RequestWithUser extends Request {
    user: mongoose.Document | null;
}

const authUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            //Get token from header
            token = req.headers.authorization.split(' ')[1];

            if (!process.env.JWT_SECRET) {
                res.status(500).json({ message: 'JWT_SECRET is not set' });
                return;
            }
            const decoded:any = jwt.verify(token, process.env.JWT_SECRET);

            //Get user from token
            (req as RequestWithUser).user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            console.log(error);
            res.status(401).json({ message: 'Not Authorized' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not Authorized' });
    }
});

export {authUser};