'use strict';

// const transaction = require('../models/transaction');

const { User, Account, Profile, Transaction } = require('../models');
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
  
// changed to get balance by accNo
exports.getByAccNo = async function (req, res) {
    try {
        const accountNo = req.params.account_no; // assuming account_no is provided in the request params

        // Find the account by account_no
        const account = await Account.findOne({
            where: { account_no: accountNo },
            include: [{
                model: User,
                attributes: ['username'],
            }],
        });

        if (!account) {
            return res.status(404).send(`Account with account number ${accountNo} does not exist in the database`);
        }

        const username = account.User ? account.User.username : `Unknown`;

        // res.json(`The account balance of ${username} is ${formatter.format(account.balance)}`);
        res.json(account);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.GetTransactionHistory = function(req, res) {
    Transaction.findAll({ account_no: req.params.acc_number }, function(err, transaction) {
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
        const { account_no, amount, description, sender } = req.body;

        if (!(account_no && amount && description)) {
            return res.status(400).send("All input fields are required");
        }

        // Find the beneficiary based on the provided account number
        const beneficiary = await Account.findOne({ where: { account_no } });

        if (!beneficiary) {
            return res.status(400).send("User with this account number does not exist");
        }

        // Find the current user based on the user_id from the request
        const currentUser = await User.findByPk(req.user.user_id, {
            include: [{
                model: Account // Specify the attributes you want to include
            }],
        });
        console.log(currentUser.Accounts);
        if (!currentUser) {
            return res.status(400).send("Current user not found");
        }
        const senderAccount = await Account.findOne({ where: { account_no: sender } });
        // Check if the transfer is between the user's own accounts
        
        if (!senderAccount) {
            return res.status(400).send("Sender account not found");
        }
        
        
        // const isTransferToOwnAccount = currentUser.Accounts.some(
        //     userAccount => userAccount.id === beneficiary.id
        // );

        if (senderAccount === beneficiary) {
            return res.status(400).send("You cannot transfer money to the same account");
        }

        if (amount > senderAccount.balance && amount <= 0) {
            return res.status(400).send("Invalid transfer amount or insufficient funds");
        }

        // Update beneficiary and current user account balances
        beneficiary.accountBalance += amount;
        currentUser.Accounts[0].accountBalance -= amount;

        // Save changes to the database
        await beneficiary.save();
        await currentUser.Accounts[0].save();

        // Create a transaction record
        const transactionDetails = {
            type: 'Transfer',
            account_no,
            description,
            sender: senderAccount.account_no,
            transactionAmount: amount,
        };

        await Transaction.create(transactionDetails);

        return res.status(200).send(`Transfer of ${formatter.format(amount)} to ${account_no} was successful`);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal Server Error' });
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