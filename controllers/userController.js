'use strict';

// const transaction = require('../models/transaction');

const { User, Account, Profile, Transaction } = require('../models');
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
// const mongoose = require("mongoose"),
//     User = mongoose.model("user"),
//     Transaction = mongoose.model("transaction"),
//     session = mongoose.startSession,
//     jwt = require("jsonwebtoken"),
//     auth = require("../../../bankify/middleware/auth"),
//     bcrypt = require("bcrypt");

exports.getAll = async function (req, res) {
    try {
        console.log(User);
        const users = await User.findAll({
            include: [Account],
          });
        res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

exports.find_user_byId = async function (req, res) {
  try {
    const user = await User.findByPk(req.params.id,
        { include: [Account] });
    if (!user) {
      res.status(404).send("User does not exist in the database");
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.register_user = async function(req, res) {
    try {
        // Get user input
        const { username, email, password, role_id } = req.body;
        console.log(req.body.username);
        // Validate user input
        if (!(username && email && password && role_id)) {
            res.status(400).send("All input is required");
        }
        console.log("find user");
        const oldUser = await User.findOne({ where: { email } });
        console.log(oldUser);
        if (oldUser) {
            return res.status(409).send("User Already Exist. Please Login");
        }
        console.log("new user");
        let encryptedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            email: email.toLowerCase(),
            password: encryptedPassword,
            role_id: role_id || 2,
        });
        console.log(user.id);
        // Create token
        const token = jwt.sign({ user_id: user.id, email },
            process.env.TOKEN_KEY, {
                expiresIn: "24h",
            }
        );
        // save user token
        user.token = token;
        console.log(user.token);
        // return new user
        res.status(201).json(user);
    } catch (err) {
        return res.json({ message: err });
    }
}

exports.login_a_user = async function(req, res) {
    try {
        const { email, password } = req.body;

        if (!(email && password)) {
            res.status(400).send("All input is required");
        }

        const user = await User.findOne({ email });

        if (user === null || (await bcrypt.compare(password, user.password) === false)) {
            res.status(400).send("Invalid Credentials");
        }


        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign({ user_id: user._id, email },
                process.env.TOKEN_KEY, {
                    expiresIn: "2h",
                }
            );

            user.token = token;
            res.status(200).json(user);
        }

    } catch (err) {
        return res.json({ message: err });
    }
}

exports.change_password = async function(req, res) {
    try {
        const { email, password, newPassword, newPassConfirm } = req.body;
        if (!(email && password && newPassword && newPassConfirm)) {
            res.status(400).send("All input are required");
        }
        const user = await User.findOne({ email });
        if (user === null || (await bcrypt.compare(password, user.password) === false)) {
            res.status(400).send("Invalid Credentials");
        }
        if (newPassword !== newPassConfirm) {
            res.status(400).send("New password and Password confirmation must match");
        }
        if (user && (await bcrypt.compare(password, user.password)) && newPassword === newPassConfirm) {
            let encryptedPassword = await bcrypt.hash(newPassConfirm, 10);
            user.password = encryptedPassword;
            user.save();
            res.status(200).send("Password Changed Successfully");
        }
    } catch (e) {
        return res.json({ message: e });
    }
}

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'NGN'
});

//testing authorization
exports.auth = function(req, res) {
    res.status(200).send("Welcome to This Bank Api built with NodeJs");
}