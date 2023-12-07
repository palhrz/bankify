'use strict';

const auth = require("../middleware/auth")


module.exports = function(app) {
    const bankApi = require('../controllers/userController');
    const cors = require("cors");
    app.use(cors());
    app.route('/api/register')
        .post(bankApi.register_user);
    
    app.route('/api/verify/:user_id/:uuid')
        .get(bankApi.verify_user);

    app.route('/api/users')
        .get(bankApi.getAll);

    app.route('/api/changePassword')
        .put(bankApi.change_password);

    app.route('/api/user/:id')
        .get(bankApi.find_user_byId);

    app.route('/api/login')
        .post(bankApi.login_a_user);

    // app.route('/')
    //     .get(bankApi.auth);

    app.route('/api/delete/:user_id')
        .delete(bankApi.delete_user);
};
