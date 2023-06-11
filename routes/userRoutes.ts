import express from "express";
import {
	registerUser,
	loginUser,
	googleSignIn,
	checkPassword,
	setPassword,
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

module.exports = router;
