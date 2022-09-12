import express from "express";
import * as transactionController from "../controllers/transaction.controllers.js";
import userLoged from "../middlewares/transaction.middleware.js";
const router = express.Router();

router.use(userLoged);
router.post("/transaction", transactionController.createTransaction);
router.get("/transaction", transactionController.listTransactions);

export default router;
