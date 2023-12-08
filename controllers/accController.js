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
 
exports.getAllTrx = async function (req, res) {
    try {
        const trx = await Transaction.findAll();
        res.json(trx);
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
                attributes: ['email'],
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

exports.accByUserId = async function (req, res) {
    try {
        const user_id = req.params.user_id; // assuming account_no is provided in the request params

        // Find the account by account_no
        const account = await Account.findAll({
            where: { user_id: user_id },
            include: [{
                model: User,
                attributes: ['email'],
            }],
        });

        if (!account) {
            return res.status(404).send(`Account with account number ${user_id} does not exist in the database`);
        }

        // const username = account.User ? account.User.username : `Unknown`;

        // res.json(`The account balance of ${username} is ${formatter.format(account.balance)}`);
        res.json(account);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.tranxByUserId = async function (req, res) {
    try {
        const userId = req.params.user_id; // assuming user_id is provided in the request params

        // Find all accounts for the user including associated transactions
        const userAccounts = await Account.findAll({
            where: { user_id: userId },
            include: [{
                model: Transaction,
                // attributes: ['beneficiary_name', 'account_no', 'beneficiary_name', 'type', 'amount', 'reference', 'status', 'reason','createdAt'],
            }],
        });

        if (!userAccounts || userAccounts.length === 0) {
            return res.status(404).send(`User with ID ${userId} does not have any associated accounts`);
        }

        res.json(userAccounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.payment_by_UserId = async function (req, res) {
    try {
        const userId = req.params.user_id; 

        // Find all accounts for the user including associated transactions
        const userAccounts = await Account.findAll({
            where: { user_id: userId },
            include: [{
                model: Transaction,
                where: { type: 'Payment' }, // Filter transactions with type==='Payment'
                // attributes: ['beneficiary_name', 'account_no', 'type', 'amount', 'reference', 'status', 'reason', 'createdAt'],
            }],
        });

        if (!userAccounts || userAccounts.length === 0) {
            return res.status(404).send(`User with ID ${userId} does not have any associated accounts`);
        }

        res.json(userAccounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//search transaction history by sender acc number
exports.GetTransactionHistory = function(req, res) {
    Transaction.findAll({
        where: { sender: req.params.acc_number }
    })
    .then(transactions => {
        if (transactions.length === 0) {
            res.status(404).send(`Transaction with account number ${req.params.acc_number} does not exist`);
        } else {
            res.json(transactions);
        }
    })
    .catch(err => {
        console.error('Error:', err);
        res.status(500).send('Internal Server Error');
    });
};

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'MYR'
});

exports.createAccount = async function (req, res) {
    try {
        const { account_name, account_type, user_id } = req.body;
    
        if (!(account_name, account_type && user_id)) {
            res.status(400).send("All input is required");
            return;
        }
        
        const existingAccount = await Account.findOne({ where: { account_type, user_id } });
        if (existingAccount) {
            res.status(400).send("Account already exists");
            return;
        }

        const account = await Account.create({
            account_name,
            account_type,
            user_id
        });
        console.log(account);
        res.status(201).json(account);
    } catch (error) {
        console.error("Failed",error);
        res.status(500).json({ message: error.message });
    }
  };

exports.deposit_funds = async function(req, res) {
    try {
        const { account_no, amount } = req.body;
        if (!(account_no && amount)) {
            res.status(400).send("All input are required");
        }
        let acc = await Account.findOne({ where: { account_no } });
        if (acc === null) {
            res.status(404).send(`This User with account number ${account_no} does not exist`);
        }
        console.log(acc);
        if (amount < 10) {
            let transactionDetails = {
                type: 'Deposit',
                account_no: account_no,
                amount: amount,
                status: 'failed',
                reason: 'Deposit amount less than 10',
                account_id: acc.id
            };
            await Transaction.create(transactionDetails)
            res.status(400).send(`Sorry, deposit amount cannot be less than 10`);
        }
        if (amount >= 10) {
            acc.balance = acc.balance + amount;
            let transactionDetails = {
                type: 'Deposit',
                account_no: account_no,
                amount: amount,
                status: 'success',
                reason: 'Deposit successful',
                account_id: acc.id
            };
            await acc.save();
            console.log('saved');
            await Transaction.create(transactionDetails)
            res.status(201).send(`Deposit of ${formatter.format(amount)} to ${account_no} was successful.`)
        }

    } catch (err) {
        return res.json({ message: err });
    }
}

//make corection, add reference. desc change to reason. add benefeciary name
exports.payment = async function(req, res) {
    try {
        const { name, account_no, amount, sender, reference, user_id } = req.body;

        if (!(account_no && amount && sender && reference)) {
            return res.status(400).send("All input fields are required");
        }

        // Find the beneficiary based on the provided account number
        const beneficiary = await Account.findOne({ where: { account_no } });
        const senderAccount = await Account.findOne({ where: { account_no: sender } });
        if (!beneficiary) {
            const transactionDetails = {
                beneficiary_name: name,
                type: 'Payment',
                account_no,
                status: 'failed',
                reason: 'Beneficiary acc not exist', // Add a description if needed
                reference: reference,
                sender: sender,
                amount: amount,
                account_id: senderAccount.id,
            };
    
            await Transaction.create(transactionDetails);
            return res.status(400).send("User with this account number does not exist");
        }
        // Find the current user based on the user_id from the request
        

        if (!senderAccount) {
            return res.status(400).send("Sender account not found");
        }

        // Check if the transfer is between the user's own accounts
        if (senderAccount.account_no === beneficiary.account_no) {
            const transactionDetails = {
                beneficiary_name: name,
                type: 'Payment',
                account_no,
                status: 'failed',
                reason: 'Same account number', // Add a description if needed
                reference: reference,
                sender: senderAccount.account_no,
                amount: amount,
                account_id: senderAccount.id,
            };
    
            await Transaction.create(transactionDetails);
            return res.status(400).send("You cannot make payment to the same account");
        }

        if (amount > senderAccount.balance || amount <= 0) {
            
            const transactionDetails = {
                beneficiary_name: name,
                type: 'Payment',
                account_no,
                status: 'failed',
                reason: 'Insufficient balance',
                reference: reference,
                sender: senderAccount.account_no,
                amount: amount,
                account_id: senderAccount.id,
            };
    
            await Transaction.create(transactionDetails);
            return res.status(400).send("Invalid transfer amount or insufficient funds");
        }

        // Update beneficiary and current user account balances
        beneficiary.balance += amount;
        senderAccount.balance -= amount;

        // Save changes to the database
        await beneficiary.save();
        await senderAccount.save();

        // Create a transaction record
        const transactionDetails = {
            beneficiary_name: name,
            type: 'Payment',
            account_no,
            status: 'Success',
            reason: 'Payment successful',
            reference: reference,
            sender: senderAccount.account_no,
            amount: amount,
            account_id: senderAccount.id,
        };

        await Transaction.create(transactionDetails);

        return res.status(200).send(`Transfer of ${formatter.format(amount)} to ${account_no} was successful`);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
exports.transfer_money = async function(req, res) {
    try {
        const { account_no, amount, sender, user_id } = req.body;

        if (!(account_no && amount && sender && user_id)) {
            return res.status(400).send("All input fields are required");
        }

        // Find the beneficiary based on the provided account number
        const beneficiary = await Account.findOne({ where: { account_no } });

        if (!beneficiary) {
            return res.status(400).send("User with this account number does not exist");
        }
        // Find the current user based on the user_id from the request
        const senderAccount = await Account.findOne({ where: { account_no: sender } });

        if (!senderAccount) {
            return res.status(400).send("Sender account not found");
        }

        // Check if the transfer is between the user's own accounts
        if (senderAccount.account_no === beneficiary.account_no) {
            const transactionDetails = {
                type: 'Transfer',
                account_no,
                status: 'failed',
                reason: 'Same account number',
                sender: senderAccount.account_no,
                amount: amount,
                account_id: beneficiary.id,
            };
    
            await Transaction.create(transactionDetails);
            return res.status(400).send("You cannot transfer money to the same account");
        }

        if (amount > senderAccount.balance || amount <= 0) {
            
            const transactionDetails = {
                type: 'Transfer',
                account_no,
                status: 'failed',
                reason: 'Insufficient balance',
                sender: senderAccount.account_no,
                amount: amount,
                account_id: beneficiary.id,
            };
    
            await Transaction.create(transactionDetails);
            return res.status(400).send("Invalid transfer amount or insufficient funds");
        }

        // Update beneficiary and current user account balances
        beneficiary.balance += amount;
        senderAccount.balance -= amount;

        // Save changes to the database
        await beneficiary.save();
        await senderAccount.save();

        // Create a transaction record
        const transactionDetails = {
            type: 'Transfer',
            account_no,
            status: 'success',
            reason: 'Transfer successful',
            sender: senderAccount.account_no,
            amount: amount,
            account_id: beneficiary.id
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
        const { withdrawAmount, sender } = req.body;
        if (!withdrawAmount && !sender) {
            res.status(400).send("Please input the amount you'd like to withdraw");
        }
        let senderAccount = await Account.findOne({ where: { account_no: sender } });
        if (withdrawAmount > senderAccount.balance) {
            res.status(402).send("Insufficient funds to make this withdrawal");
        }
        senderAccount.balance = senderAccount.balance - withdrawAmount;
        let transactionDetails = {
            type: 'Withdraw',
            sender: senderAccount.account_no,
            status: 'success',
            reason: 'Withdrawal successful',
            description: `Withdrawal of ${formatter.format(withdrawAmount)}`,
            //sender: currentUser.accountNumber,
            amount: withdrawAmount
        };
        await senderAccount.update({ balance: senderAccount.balance });
        await Transaction.create(transactionDetails);
        res.status(200).send(`Withdrawal of ${formatter.format(withdrawAmount)} from ${sender} was successful`);
    } catch (e) {
        res.json({ message: e });
    }
}

//testing authorization
exports.auth = function(req, res) {
    res.status(200).send("Welcome to This Bank Api built with NodeJs");
}