import express from "express";
import {
	registerUser,
	loginUser,
	googleSignIn,
	checkPassword,
	setPassword,
	setWeeklyBudget,
	getWeeklyBudget,
	savePrediction,
	getWeeklyPrediction,
} from "../controllers/userControllers";
import { authUser } from "../middlewares/authMiddleware";

const router = express.Router();

//public
router.post("/", loginUser);
router.post("/register", registerUser);
router.post("/googlesignin", googleSignIn);

//private
router.post("/checkpassword", authUser, checkPassword);
router.post("/setpassword", authUser, setPassword);
router.post("/setbudget", authUser, setWeeklyBudget);
router.get("/getbudget", authUser, getWeeklyBudget);
router.post("/saveprediction", authUser, savePrediction);
router.get("/getweeklyprediction", authUser, getWeeklyPrediction);

module.exports = router;
