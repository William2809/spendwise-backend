import express from "express";
import dotenv from "dotenv";
import {
	addTransaction,
	analyzeAndRecommend,
	classifyTransaction,
	deleteTransaction,
	editTransaction,
	getPrediction,
	getTransaction,
	requestDeleteDailyTransaction,
	requestUpdateDailyTransaction,
} from "../controllers/transactionController";
dotenv.config();
import { authUser } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/add", authUser, addTransaction);
router.get("/get", authUser, getTransaction);
router.get("/recommend", authUser, analyzeAndRecommend);
router.get("/predict", authUser, getPrediction);
router.post("/classify", authUser, classifyTransaction);
router.delete("/delete", authUser, deleteTransaction);
router.put("/edit", authUser, editTransaction);
router.get("/updatedailytransactions", authUser, requestUpdateDailyTransaction);
router.delete(
	"/deletedailytransactions",
	authUser,
	requestDeleteDailyTransaction
);

module.exports = router;
