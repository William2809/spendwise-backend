import express from 'express';
const dotenv = require('dotenv').config();
import { connectDB } from './config/db';

const PORT = process.env.PORT || 5000;
const app = express();
connectDB();

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.all('*', (req: any, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Credentials', "*");
    next();
});

//User routes
app.use('/api/users', require('./routes/userRoutes'));

//Transaction routes
app.use('/api/transactions', require('./routes/transactionRoutes'));

app.get('/', (req, res) => {
    res.status(200).json({ message: "Welcome to SpendWise api" });
})

app.listen(PORT, () => console.log(`server started on PORT ${PORT}`));