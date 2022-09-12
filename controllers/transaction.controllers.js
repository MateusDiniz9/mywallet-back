import joi from "joi";
import mongo from "../db/db.js";
import dayjs from "dayjs";

const transactionSchema = joi.object({
  type: joi.string().valid("add_transaction", "sub_transaction").required(),
  value: joi.number().required(),
  description: joi.string().min(1).required(),
});

let db = await mongo();

const createTransaction = async (req, res) => {
  const { type, value, description } = req.body;

  const validation = transactionSchema.validate(
    { type, value, description },
    { abortEarly: false }
  );
  if (validation.error) {
    const errors = validation.error.details.map((detail) => detail.message);
    return res.status(422).send(errors);
  }

  try {
    const user = res.locals.user;

    await db.collection("transactions").insertOne({
      type,
      value,
      description,
      userId: user._id,
      date: dayjs().format("DD/MM"),
    });
    res.sendStatus(201);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const listTransactions = async (req, res) => {
  try {
    const user = res.locals.user;
    const transactions = await db
      .collection("transactions")
      .find({ userId: user._id })
      .toArray();
    res.send(transactions);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export { createTransaction, listTransactions };
