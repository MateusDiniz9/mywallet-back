import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongo from "./db/db.js";
import authRouter from "./routers/auth.routers.js";
import transactionRouter from "./routers/transaction.routers.js";

let db = await mongo();
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(authRouter);
app.use(transactionRouter);

setInterval(async function inactiveSessionsTwoHours() {
  try {
    const usersSessions = await db.collection("sessions").find().toArray();
    const inactiveUsers = usersSessions.filter(
      (user) => Date.now() - user.lastStatus > 7200000
    );
    inactiveUsers.forEach(async (user) => {
      await db.collection("sessions").deleteOne(user);
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
}, 20000);

app.listen(5000, () => console.log("Listening on port: 5000"));
