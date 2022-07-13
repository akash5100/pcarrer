import express from "express";
import db from "../database.js";
import { validateScores, validateSubject } from "../utils.js";
const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    status: "Ok",
    message: "This endpoint is used to get/post scores of a user in different subjects.",
  });
});

router.get("/:subject", (_req, res, _next) => {
  const subject = _req.params.subject;
  if (!validateSubject(subject)) {
    res.status(400).json({ error: "Invalid subject." });
    return;
  }

  db.all(`SELECT * FROM ${subject}`, (err, rows) => {
    if (err) {
      console.error(err.message);
      throw err;
    } else {
      res.status(200).json(rows);
    }
  });
});

router.get("/:subject/:user_id", (req, res, _next) => {
  var params = [req.params.user_id];
  var name = "";
  const subject = req.params.subject;
  if (!validateSubject(subject)) {
    res.status(400).json({ error: "Invalid subject." });
    return;
  }

  db.get(`SELECT name FROM user WHERE id = ?`, params, (err, row) => {
    if (err) {
      console.error(err.message);
      throw err;
    } else if (row === undefined) {
      res.status(400).json({ error: "User does not exist." });
      return;
    } else {
      name = row.name;
    }
  });

  db.all(`SELECT * FROM ${subject} WHERE user_id = ?`, params, (err, rows) => {
    if (err) {
      console.error(err.message);
      throw err;
    } else {
      res.status(200).json({
        name: name,
        scores: rows,
      });
    }
  });
});

router.post("/:subject/:user_id", (req, res, _next) => {
  const subject = req.params.subject;
  if (!validateSubject(subject)) {
    res.status(400).json({ error: "Invalid subject." });
    return;
  }

  const Valid = validateScores(req, res);
  if (!Valid) {
    return;
  }
  var data = {
    ct1: req.body.ct1,
    ct2: req.body.ct2,
    final: req.body.final,
    user_id: req.params.user_id,
  };

  var params = [data.user_id];
  var name = "";
  db.get(`SELECT name FROM user WHERE id = ?`, params, (err, row) => {
    if (err) {
      console.error(err.message);
      throw err;
    } else if (row === undefined) {
      res.status(400).json({ error: "User does not exist." });
      return;
    } else {
      name = row.name;
    }
  });

  var params = [data.ct1, data.ct2, data.final, data.user_id];
  db.run(`INSERT INTO ${subject} (ct1, ct2, final, user_id) VALUES (?,?,?,?)`, params, (err, result) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "Success",
      data: data,
    });
  });
});

export default router;
