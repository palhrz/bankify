'use strict';

const auth = require("../middleware/auth")


module.exports = function(app) {
    const bankApi = require('../controllers/userController');

    app.route('/api/register')
        .post(bankApi.register_user);

    app.route('/api/transfer')
        .post(auth, bankApi.transfer_money);

    app.route('/api/withdraw')
        .post(auth, bankApi.withdraw_money);

    app.route('/api/users')
        .get(bankApi.get_all_users);

    app.route('/api/transaction/:acc_number')
        .get(bankApi.GetTransactionHistory);

    app.route('/api/balance/:id')
        .get(bankApi.getUserBalance);

    app.route('/api/changePassword')
        .put(bankApi.change_password);

    app.route('/api/user/:Id')
        .get(bankApi.find_user_byId);

    app.route('/api/login')
        .post(bankApi.login_a_user);

    app.route('/api/welcome')
        .post(auth, bankApi.auth);

    app.route('/api/deposit')
        .post(bankApi.deposit_funds);
};