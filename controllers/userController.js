'use strict';

// const transaction = require('../models/transaction');

const { User, UserVerify, Account, Profile, Transaction } = require('../models');
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const {v4: uuidv4} = require('uuid');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    // host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    debug: true,
    secureConnection: false,
    auth: {
        user: 'naufal.ha@gmail.com',
        pass: 'ebjz rolu raoo ieuk',
    },
    tls:{
        rejectUnAuthorized:true
    }
});
console.log('Connecting ..............');
// const transporter = nodemailer.createTransport({
//     service: 'smtp.ethereal.email',
//     port: 587,
//     secure: false,
//     ignoreTLS: true,
//     debug: true,
//     auth: {
//         user: 'julie.orn@ethereal.email',
//         pass: '2VuCD7MNzaJSR8P3wy',
//     }
// });

transporter.verify(function(error, success) {
    // console.log('Connecting ..............');
    if (error) {
        console.error('Error connecting to the SMTP server:', error);
    } else {
        console.log('Server is ready to take messages', success);
    }
});

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

async function sendEmail(user, res) {
    const url = `http://localhost:9000`;
    const uuid = uuidv4() + user.id;
    // const htmlContent = fs.readFileSync('C:\\Users\\NopalTUF\\bankifyFE\\FYP\\email.html', 'utf8');

    const verificationLink = `${url}/email?user_id=${user.id}&uuid=${uuid}`;
    // const modifiedHtmlContent = htmlContent.replace('{{verification_link}}', verificationLink);

    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: user.email,
        subject: 'Verify Your Account',
        html: `<h1>Please verify your account</h1><p>Click the link below to verify your account</p><a href=${verificationLink}>Verify</a>`
        // /user/verify/${uniqString}
        // modifiedHtmlContent
    };

    
    const saltRounds = 10;
    const hashedUniqString = await bcrypt.hash(uuid, saltRounds);

        // Use await with User_Verify.create
    const userVerification = await UserVerify.create({
        user_id: user.id,
        uuid: hashedUniqString,
    });
    console.log('Sewnding email...');
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log("Send mail error",error);
            res.status(500).send("Error sending email");
        } else {
            console.log('Email sent: ' + info.response);
            res.status(200).send("Email sent: " + info.response);
        }
    });
}

exports.verify_user = async function(req, res) {
    try {
        const { user_id, uuid } = req.params;
        console.log('Verifying....', user_id, uuid);

        const userVerification = await UserVerify.findOne({ where: { user_id } });

        if (!userVerification) {
            return res.status(404).send('User verification record not found');
        }

        // Assuming userVerification.uuidv4 is the unique string for verification
        const result = await bcrypt.compare(uuid, userVerification.uuid);

        if (result) {
            // Delete the verification record
            await userVerification.destroy();

            // Update the User model to set the 'verified' field to true
            const [updatedRowsCount] = await User.update(
                { verified: true },
                { where: { id: user_id } }
            );
            console.log(updatedRowsCount);
            // Check if the update was successful
            if (updatedRowsCount === 1) {
                console.log('Successfully');
                return res.status(200).send('User verified successfully');
            } else {
                console.log('failed');
                return res.status(500).send('Failed to update user verification status');
            }
        } else {
            console.log('Compare failed');
            return res.status(400).send('Invalid verification string');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
};

exports.register_user = async function(req, res) {
    try {
        // Get user input
        const { first_name, last_name, email, password, role_id, verified } = req.body;
        // console.log(req.body.username);
        // Validate user input
        if (!(first_name && last_name && email && password )) {
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
            first_name,
            last_name,
            email: email.toLowerCase(),
            password: encryptedPassword,
            // role_id: role_id || 2,
            verified: false
        })
        
        sendEmail(user, res);
        // console.log(user.id);
        // // Create token
        // const token = jwt.sign({ user_id: user.id, email },
        //     process.env.TOKEN_KEY, {
        //         expiresIn: "24h",
        //     }
        // );
        // save user token
        // user.token = token;
        // console.log(user.token);
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
            return;
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            res.status(400).send("Invalid Credentials");
            return;
        }

        if (user.verified !== true) {
            res.status(401).send("Account not verified. Please verify your account.");
        } else {
            const token = jwt.sign({ user_id: user.id, email },
                process.env.TOKEN_KEY, {
                    expiresIn: "2h",
                }
            );

            user.token = token;
            res.status(200).json(user);
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


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

exports.delete_user = async function (req, res) {
    try {
        const userId = req.params.user_id;

        // Check if the user exists
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete the user
        await user.destroy();

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'MYR'
});

//testing authorization
exports.auth = function(req, res) {
    res.status(200).send("Welcome to This Bank Api built with NodeJs");
}