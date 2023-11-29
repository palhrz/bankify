'use strict';

// const transaction = require('../models/transaction');

const User = require('../models/user');
const Transaction = require('../models/transaction');
const Account = require('../models/account');
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");

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
      const acc = await Account.findByPk(req.params.id, {
        include: [{
          model: User,
          attributes: ['username'], 
        }],
      });

      if (!acc) {
        res.status(404).send(`User with Id ${req.params.id} does not exist in the database`);
      }
      const username = acc.User ? acc.User.username : `Unknown`

      res.json(`The account balance of ${username} is ${formatter.format(acc.balance)}`);
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

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'MYR'
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