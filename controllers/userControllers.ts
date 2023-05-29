import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel';
import dotenv from  'dotenv';
dotenv.config();

//Generate token
const generateToken = (id: any) => {
    return jwt.sign({ id }, process.env.JWT_SECRET as string, {
        expiresIn: '60d',
    })
}

// Desc: Login a user
// Route : /api/users/
// access : public
const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    //Check if username/email is in the database
    const user = await User.findOne({ email: email }) || await User.findOne({ email: email });

    if (user && (await bcrypt.compare(password as string, user.password as string))) {
        res.status(200).json({
            _id: user._id,
            email: user.email,
            picture: user.picture,
            token: generateToken(user._id),
        });
    }
    else {
        res.status(401).json({ message: "Invalid Credentials" });
    }
});

// Desc: Register a new user
// Route : /api/users/register
// access : public
const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    
    if(!name || !email || !password){
        res.status(400).json({ message: 'Please include all fields!' });
    }

    //Find if email is already used
    const userExists = await User.findOne({ email: email });
    if (userExists) {
        res.status(400).json({ message: 'Email is not available.' });
        throw new Error('Email is not available.');
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
            token: generateToken(user._id),
        });
    }
});

// desc:   Register/Login user via google oauth
// route: /api/users/googlesignin
// access: public
const googleSignIn = asyncHandler(async (req: {
    body: {
        name: String;
        email: String;
        picture: String;
    };
}, res: any) => {
    const { name, email, picture } = req.body; //get data from request

    const userExist = await User.findOne({ email: email });
    if (userExist) {
        res.status(200).json({
            _id: userExist._id,
            name: userExist.name,
            email: userExist.email,
            picture: userExist.picture,
            token: generateToken(userExist._id),
        });
    }
    else {
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
                token: generateToken(user._id),
            });
        }
    }
});

export {
    registerUser,
    loginUser,
    googleSignIn
}