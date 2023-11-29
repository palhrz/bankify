'use strict';

const auth = require("../middleware/auth")


module.exports = function(app) {
    const accApi = require('../controllers/accController');

    app.route('/api/transfer')
        .post(auth, accApi.transfer_money);

    app.route('/api/withdraw')
        .post(auth, accApi.withdraw_money);

    app.route('/api/transaction/:acc_number')
        .get(accApi.GetTransactionHistory);

    app.route('/api/balance/:id')
        .get(accApi.getUserBalance);

    app.route('/api/deposit')
        .post(accApi.deposit_funds);
};