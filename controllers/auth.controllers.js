import joi from "joi";
import bcrypt from "bcrypt";
import mongo from "../db/db.js";
import { v4 as uuid } from "uuid";

const signUpSchema = joi.object({
  name: joi.string().min(1).required(),
  email: joi.string().email().min(5).required(),
  password: joi.string().min(1).required(),
});

const signInSchema = joi.object({
  email: joi.string().email().min(5).required(),
  password: joi.string().min(1).required(),
});

let db = await mongo();

const signUp = async (req, res) => {
  const { name, email, password } = req.body;

  const validation = signUpSchema.validate(
    { name, email, password },
    { abortEarly: false }
  );
  if (validation.error) {
    const errors = validation.error.details.map((detail) => detail.message);
    return res.status(422).send(errors);
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  try {
    const userAlreadyExists = await db
      .collection("users")
      .findOne({ $or: [{ name }, { email }] });
    if (userAlreadyExists) {
      return res.sendStatus(409);
    }

    await db
      .collection("users")
      .insertOne({ name, email, password: passwordHash });
    res.sendStatus(201);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const signIn = async (req, res) => {
  const { email, password } = req.body;

  const validation = signInSchema.validate(
    { email, password },
    { abortEarly: false }
  );
  if (validation.error) {
    const errors = validation.error.details.map((detail) => detail.message);
    return res.status(422).send(errors);
  }

  try {
    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return res.sendStatus(404);
    }

    const passwordValid = bcrypt.compareSync(password, user.password);

    if (passwordValid) {
      const token = uuid();
      const name = user.name;
      await db
        .collection("sessions")
        .insertOne({ userID: user._id, token, lastStatus: Date.now() });
      const response = { token, name };
      res.send(response);
    } else {
      res.sendStatus(401);
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export { signUp, signIn };
