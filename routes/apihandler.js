/*
 *  HANDLE THE MSAPI
 */
const debug = false;
const debugText = false;

const m = {
    msapi       : require('./../datas/private-msapi-key.json'),
    https       : debug ? require('http') : require('https')
};
const baseAPIURL = debug ? 'localhost' : 'msapi.mecanicascience.fr';



function sendMessage(label, datas, onSuccess = defaultRequestSuccess, onFailure = defaultRequestFailure) {
    let dest;
    switch (label) {
        case 'user_posted_comment':
            dest = '/notifications/send';
            break;
        default:
            dest = '/';
    }

    sendRequest(dest, { label : label, datas : datas }, onSuccess, onFailure);

    /*
    {
        notification : false | {
            title : "_title of your popup_",
            body : "_body_"
        },
        payload : {
            data_1 : "value_1"
        }
    }
    */
}


function sendRequest(dest, datas, onSuccess, onFailure) {
    datas.identification = {
        tag    : 'mecanica_science_website',
        uuid   : m.msapi.uuid,
        apikey : encodeURIComponent(m.msapi.key)
    };
    datas.dummyEndData = '############################################################';

    let postData = JSON.stringify(datas);
    let options = {
        hostname : baseAPIURL,
        path     : dest + `?uuid=${m.msapi.uuid}&apikey=${encodeURIComponent(m.msapi.key)}`,
        method   : 'POST',
        headers  : {
            'Content-Type'   : 'text/plain',
            'Content-Length' : postData.length
        }
    };
    if (debug)
        options.port = 8081;

    let req = m.https
        .request(options, defaultRequestSuccess)
        .on('error', defaultRequestFailure);

    req.write(postData);
    req.end();
}




function defaultRequestSuccess(res) {
    let data = '';

    if (debugText) {
        console.log('Status Code :', res.statusCode);
        console.log('Headers :', res.headers);
    }

    // Chunk of data recieved
    res.on('data', (chunk) => {
        data += chunk;
    });

    // Whole response received
    res.on('end', () => {
        if (debugText)
            console.log(data);
    });
}


function defaultRequestFailure(err) {
    if (debugText)
        console.error(err.message);
}


/* ====== SERVER ====== */
module.exports = {
    sendMessage
}
