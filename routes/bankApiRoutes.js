'use strict';

const auth = require("../middleware/auth")


module.exports = function(app) {
    const bankApi = require('../controllers/userController');

    app.route('/api/register')
        .post(bankApi.register_user);

    app.route('/api/users')
        .get(bankApi.getAll);

    app.route('/api/changePassword')
        .put(bankApi.change_password);

    app.route('/api/user/:Id')
        .get(bankApi.find_user_byId);

    app.route('/api/login')
        .post(bankApi.login_a_user);

    app.route('/api/welcome')
        .post(auth, bankApi.auth);
};
