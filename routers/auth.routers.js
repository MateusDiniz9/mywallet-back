import express from "express";
import * as authController from "../controllers/auth.controllers.js";

const router = express.Router();

router.post("/sign-up", authController.signUp);
router.post("/sign-in", authController.signIn);

export default router;
