import express from "express";
import dotenv from "dotenv";
import {
	addTransaction,
	analyzeAndRecommend,
	classifyTransaction,
	deleteTransaction,
	editTransaction,
	getTransaction,
} from "../controllers/transactionController";
dotenv.config();
import { authUser } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/add", authUser, addTransaction);
router.get("/get", authUser, getTransaction);
router.get("/recommend", authUser, analyzeAndRecommend);
// router.get("/gettwoweeks", authUser, getTwoWeeksTransaction);
router.post("/classify", authUser, classifyTransaction);
router.delete("/delete", authUser, deleteTransaction);
router.put("/edit", authUser, editTransaction);

module.exports = router;
