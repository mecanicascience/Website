const config   = require('./../datas/config.json');
const crypto   = require('crypto');
const db       = require('./db');

// ====== PERMISSIONS ======
// permissions : 100 = everything, 50 = no edit allowed, 0 = none (connection refused)


/** Retourne true si l'utilisateur a le cookie de connection */
async function isConnected(req) {
    if(
           !req.admin_uuid     || req.admin_uuid == ''
        || !req.admin_username || req.admin_username == ''
        || !req.admin_password || req.admin_password == ''
    ) return false;

    let user = await db.getUserByUsername(req.admin_username);
    if(!user || !user.docs[0])
        return false;

    let d = user.docs[0].data();
    if (d.password == req.admin_password && d.permissions > 0 && d.uuid == req.admin_uuid)
        return true;

    return false;
}


/** Retourne true si l'utilisateur est connecté */
async function connectUser(username, password, res) {
    let encrypted_pass = crypto.createHash('md5').update(password).digest('hex');

    if(!username || username == '' || !password || password == '')
        return false;

    let user = await db.getUserByUsername(username);
    if(!user || !user.docs[0])
        return false;

    let d = user.docs[0].data();
    if(d.password != encrypted_pass || d.permissions <= 0)
        return false;

    res.cookie('admin_uuid'    , d.uuid        , { maxAge: config.session_max_age, httpOnly: false });
    res.cookie('admin_username', username      , { maxAge: config.session_max_age, httpOnly: false });
    res.cookie('admin_password', encrypted_pass, { maxAge: config.session_max_age, httpOnly: false });

    return true;
}


/** Retourne true si l'utilisateur est déconnecté */
function deconnectUser(req, res) {
    if(req.cookies.admin_username && req.cookies.admin_password) {
        res.cookie('admin_uuid'    , '', { maxAge: config.session_max_age, httpOnly: false });
        res.cookie('admin_username', '', { maxAge: config.session_max_age, httpOnly: false });
        res.cookie('admin_password', '', { maxAge: config.session_max_age, httpOnly: false });

        return true;
    }

    return false;
}

/** Teste si l'utilisateur est connecté et retourne son niveau de permission. Sinon retourne 0 */
async function getPermission(req) {
    if(
           !req.admin_uuid     || req.admin_uuid == ''
        || !req.admin_username || req.admin_username == ''
        || !req.admin_password || req.admin_password == ''
    ) return 0;

    let user = await db.getUserByUsername(req.admin_username);
    if(!user || !user.docs[0])
        return 0;

    let d = user.docs[0].data();
    if(d.password != req.admin_password)
        return 0;
    return d.permissions;
}



module.exports = {
    isConnected   : isConnected,
    connectUser   : connectUser,
    deconnectUser : deconnectUser,
    getPermission : getPermission
};
