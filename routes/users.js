const passFile = require('./../datas/pass.json');
const config   = require('./../datas/config.json');
const crypto   = require('crypto');


/** Retourne true si l'utilisateur a le cookie de connection */
function isConnected(req) {
    if(!req.admin_username || req.admin_username == '' || !req.admin_password || req.admin_password == '')
        return false;

    for (let i = 0; i < passFile.users.length; i++) {
        let u = passFile.users[i];
        if(u.permissions != 0 && u.username == req.admin_username && u.password == req.admin_password)
            return true;
    }

    return false;
}


/** Retourne true si l'utilisateur est connecté */
function connectUser(username, password, res) {
    let encrypted_pass = crypto.createHash('md5').update(password).digest('hex');

    if(!username || username == '' || !password || password == '')
        return false;

    for (let i = 0; i < passFile.users.length; i++) {
        let u = passFile.users[i];
        if(u.permissions != 0 && u.username == username && u.password == encrypted_pass) {
            res.cookie('admin_username', username      , { maxAge: config.session_max_age, httpOnly: false });
            res.cookie('admin_password', encrypted_pass, { maxAge: config.session_max_age, httpOnly: false });

            return true;
        }
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

/** Teste si l'utilisateur est connecté et retourne son niveau de permission. Sinon retourne 0 */
function getPermission(req) {
    if(!req.admin_username || req.admin_username == '' || !req.admin_password || req.admin_password == '')
        return 0;

    for (let i = 0; i < passFile.users.length; i++) {
        let u = passFile.users[i];
        if(u.permissions != 0 && u.username == req.admin_username && u.password == req.admin_password)
            return u.permissions;
    }

    return 0;
}



module.exports = {
    isConnected   : isConnected,
    connectUser   : connectUser,
    deconnectUser : deconnectUser,
    getPermission : getPermission
};
