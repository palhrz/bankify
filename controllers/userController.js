'use strict';

const transaction = require('../models/transaction');

const { User, Transaction, Account } = require('../models');
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
      const users = await User.findAll();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

exports.getAllAccount = async function (req, res) {
    try {
        const acc = await Account.findAll();
        res.json(acc);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
  
exports.getUserBalance = async function (req, res) {
    try {
      const user = await Account.findByPk(req.params.id);
      if (!user) {
        res.status(404).send(`User with Id ${req.params.id} does not exist in the database`);
      }
      res.json(`The account balance of ${user.username} is ${formatter.format(user.balance)}`);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

exports.GetTransactionHistory = function(req, res) {
    Transaction.findAll({ acc_number: req.params.acc_number }, function(err, transaction) {
        if (err)
            res.status(404).send(`User with account number ${acc_number} does not exist`);
        res.json(transaction);
    });
};

exports.find_user_byId = async function (req, res) {
  try {
    const user = await User.findByPk(req.params.id);
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
        console.log("created");
        // Create token
        const token = jwt.sign({ user_id: user._id, email },
            process.env.TOKEN_KEY, {
                expiresIn: "2h",
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

exports.createAccount = async function (req, res) {
    try {
      const { account_type, balance, user_id } = req.body;
  
      if (!(account_type && balance)) {
        res.status(400).send("All input is required");
        return;
      }
  
      const account = await Account.create({
        account_type,
        balance,
        user_id
      });
  
      res.status(201).json(account);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  exports.getAllAccounts = async function (req, res) {
    try {
      const accounts = await Account.findAll();
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

exports.deposit_funds = async function(req, res) {
    try {

        const { account_no, amount, description, acc_id } = req.body;
        if (!(account_no && amount && description && from)) {
            res.status(400).send("All input are required");
        }
        let acc = Account.findOne({ where: { account_no } });
        if (acc === null) {
            res.status(404).send(`This User with account number ${account_no} does not exist`);
        }
        if (amount < 5000) {
            res.status(400).send(`Sorry, deposit amount cannot be less than 5000`);
        }
        if (amount >= 5000) {
            acc.balance = acc.balance + amount;
            let transactionDetails = {
                transactionType: 'Deposit',
                account_no: account_no,
                description: description,
                amount: amount,
                account_id: acc_id
            };
            await acc.save();
            await Transaction.create(transactionDetails)
            res.status(201).send(`Deposit of ${formatter.format(amount)} to ${account_no} was successful.`)
        }

    } catch (err) {
        return res.json({ message: err });
    }
}

exports.transfer_money = async function(req, res) {
    try {
        const { account_no, amount, description } = req.body;
        if (!(account_no && amount && description)) {
            res.status(400).send("All input are required");
        }

        let beneficiary = await Account.findOne({ account_no });
        if (beneficiary === null) {
            res.status(400).send("User with this account number does not exist");
        }

        let currentUser = await Account.findById(req.user.user_id);
        if (amount > currentUser.balance && amount > 0) {
            res.status(400).send("Insufficient funds to make this transfer");
        }
        if (currentUser.amount === beneficiary) {
            res.status(400).send("Sorry you cannot send money to yourself");
        }

        if (currentUser.account_no !== beneficiary) {
            beneficiary.balance = beneficiary.balance + amount;
            currentUser.balance = currentUser.balance - amount;
            let transactionDetails = {
                transactionType: 'Transfer',
                account_no: account_no,
                description: description,
                sender: currentUser.account_no,
                amount: amount
            };
            await beneficiary.save();
            await currentUser.save();
            await Transaction.create(transactionDetails);

            res.status(200).send(`Transfer of ${formatter.format(amount)} to ${account_no} was successful`);
        }
    } catch (err) {
        res.json({ message: err });
    }
}

exports.withdraw_money = async function(req, res) {
    try {
        const { withdrawAmount } = req.body;
        if (!withdrawAmount) {
            res.status(400).send("Please input the amount you'd like to withdraw");
        }
        let currentUser = await User.findById(req.user.user_id);
        if (withdrawAmount > currentUser.accountBalance) {
            res.status(400).send("Insufficient funds to make this withdrawal");
        }
        currentUser.accountBalance = currentUser.accountBalance - withdrawAmount;
        let transactionDetails = {
            transactionType: 'Withdraw',
            accountNumber: currentUser.accountNumber,
            description: `NIBSS withdrawal of ${formatter.format(withdrawAmount)}`,
            //sender: currentUser.accountNumber,
            transactionAmount: withdrawAmount
        };
        await currentUser.save();
        await Transaction.create(transactionDetails);
        res.status(200).send(`Withdrawal of ${formatter.format(withdrawAmount)} was successful`);
    } catch (e) {
        res.json({ message: e });
    }
}

//testing authorization
exports.auth = function(req, res) {
    res.status(200).send("Welcome to This Bank Api built with NodeJs");
}