require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + "/views"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/index.html"));
});

app.get("/email", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/email.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/register.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/login.html"));
});

app.get("/payment", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/payment_history.html"));
});

app.get("/history", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/transact_history.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/dashboard.html"));
});

module.exports = app;
