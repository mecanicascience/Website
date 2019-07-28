const passFile = require('./../datas/pass.json');
const config   = require('./../datas/config.json');
const crypto   = require('crypto');


/** Retourne true si l'utilisateur a le cookie de connection */
function isConnected(req) {
    if(
           req.admin_username && req.admin_username != '' && req.admin_username == passFile.username
        && req.admin_password && req.admin_password != '' && req.admin_password == passFile.password
    ) return true;

    return false;
}


/** Retourne true si l'utilisateur est connecté */
function connectUser(username, password, res) {
    let encrypted_pass = crypto.createHash('md5').update(password).digest('hex');

    if(
           username && username       == passFile.username
        && password && encrypted_pass == passFile.password
    ) {
        res.cookie('admin_username', username      , { maxAge: config.session_max_age, httpOnly: false });
        res.cookie('admin_password', encrypted_pass, { maxAge: config.session_max_age, httpOnly: false });

        return true;
    }

    return false;
}


/** Retourne true si l'utilisateur est déconnecté */
function deconnectUser(req, res) {
    if(req.cookies.admin_username && req.cookies.admin_password) {
        res.cookie('admin_username', '', { maxAge: config.session_max_age, httpOnly: false });
        res.cookie('admin_password', '', { maxAge: config.session_max_age, httpOnly: false });

        return true;
    }

    return false;
}



module.exports = {
    isConnected   : isConnected,
    connectUser   : connectUser,
    deconnectUser : deconnectUser
};
