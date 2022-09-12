import mongo from "../db/db.js";

async function userLoged(req, res, next) {
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");

  if (!token) {
    return res.sendStatus(401);
  }

  try {
    let db = await mongo();
    const session = await db.collection("sessions").findOne({ token });

    if (!session) {
      return res.sendStatus(401);
    }
    const user = await db
      .collection("users")
      .findOne({ userId: session.userId });

    if (!user) {
      return res.sendStatus(404);
    }
    res.locals.user = user;
    next();
  } catch (error) {
    res.status(500).send(error.message);
  }
}

export default userLoged;
