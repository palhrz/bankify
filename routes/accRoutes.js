'use strict';

const auth = require("../middleware/auth")

//delete wdraw and depo, 
//add email verification model https://www.youtube.com/watch?v=v6Ul3o8D-js

module.exports = function(app) {
    const accApi = require('../controllers/accController');

    app.route('/api/getAccount')
        .get(accApi.getAllAccount);

    app.route('/api/createAccount')
        .post(accApi.createAccount);

    app.route('/api/transfer')
        .post(accApi.transfer_money);

    app.route('/api/withdraw')
        .post(accApi.withdraw_money);

    app.route('/api/transaction/:acc_number')
        .get(accApi.GetTransactionHistory);

    app.route('/api/balance/:account_no')
        .get(accApi.getByAccNo);
    
    app.route('/api/acc_byUserId/:user_id')
        .get(accApi.accByUserId);

    app.route('/api/tranxById/:user_id')
        .get(accApi.getByUserId);
        //test this

    app.route('/api/deposit')
        .post(accApi.deposit_funds);
};