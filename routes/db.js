const key_file_name  = './../datas/private-db-key.json';

const firebase       = require('firebase-admin');
const serviceAccount = require(key_file_name);
const config         = require('./../datas/config.json');
const crypto         = require("crypto");
const fs             = require("fs");
const path           = require('path');
const mime           = require('mime');
const {Storage}      = require('@google-cloud/storage');
const { promisify }  = require('util')

let db;



const projectId   = config.bucket_name;
const bucket_name = `${projectId}.appspot.com`;
const gcs         =  new Storage({
    projectId     : projectId,
    credentials: {
        private_key  : serviceAccount.private_key,
        client_email : serviceAccount.client_email
    }
});
const mainBucket  = gcs.bucket(bucket_name);





/**
 * Initialisation de la base de données
 */
function initializeDb() {
    firebase.initializeApp({
        credential    : firebase.credential.cert(serviceAccount),
        databaseURL   : 'https://mecanicascience.firebaseio.com'
    });

    db = firebase.firestore();
    db.settings({ timestampInSnapshots: true });
}




/* ========== LISTE DES CARACTERISTIQUES D'UN POST ========== */
/**
 * @param uuid uuid de l'article recherché
 * @return la promise
 */
async function getArticleByUUID(uuid) {
    return await db.collection('posts').where('uuid', '==', parseInt(uuid)).get();
}














/* ========== LISTE LES POSTS A LA RACINE DU SITE ========== */
/** Retourne la liste de tous les tableaux visibles */
async function getAllPostsMAIN() {
    let posts = await getPosts(undefined, undefined, 9999999);
    return posts;
}



/**
 * Affichage de tous les posts à l'accueil du site
 * @param q Search query      string
 * @param s Search category [ info, math, youtube, phys, other ]
 * @param l Search limit      int n articles
 * @param is_admin_link true : lien vers la modification de billets / false : lien vers l'affichage de billets
 * @param all_articles      true : affichage de tous les articles, même s'ils ne sont pas visibles
 * @return L'HTML du code à afficher
 */
async function getHTMLForAllPostsMAIN(q, s, l, is_admin_link, all_articles) {
    let arrHTML  = [];                                    // tableau des html à afficher
    let postAsso = await getPosts(q, s, l, all_articles); // liste des posts [{...}, {...}, ...]



    // === Compute each size ===
    if(postAsso.length == 1 || postAsso.length == 2) {
        postAsso[0].size = 2;
        if(postAsso.length == 2) postAsso[1].size = 2;
    }
    else {
        let counter = 0;
        for(let i = 0; i < postAsso.length; i++) {
            let size = postAsso[i].post.pref_size;

            if(counter == 0 || counter == 1 || (counter == 2 && size == 1)) {
                counter += size;
            }
            else if(counter == 2 && size == 2) {
                postAsso[i - 1].size = 3;
                counter = 2;
            }

            if(counter >= 3) counter = 0;
            postAsso[i].size = size;
        }
    }


    // === Compute HTML array ===
    let counterSize = 0;
    let counterHTML = '<div class="container category">';

    const articles = require('./articles');
    postAsso.forEach(el => {
        counterHTML += getHTMLForPostMAIN(el.post, el.size, articles, is_admin_link);
        counterSize += el.size;

        if(counterSize >= 3) {          // si l'élément ajouté est le 3e élément
            counterHTML += '</div>';    // ajout du div de fin de ligne
            arrHTML.push(counterHTML);  // ajoute la ligne au tableau

            counterSize = 0;
            counterHTML = '<div class="container category">';
        }
    });
    if(counterHTML != '<div class="container category">') arrHTML.push(counterHTML + '</div>'); // push le dernier élément (normalement useless)



    // === Return HTML array ===
    return arrHTML;
}





/**
 * Retourne la liste des posts correspondant à la query
 * @param q Search query      string
 * @param s Search category [ info, math, youtube, phys, other ]
 * @param l Search limit      int n articles
 * @param all_articles        true : affichage de tous les articles, même s'ils ne sont pas visibles
 * @return La liste des posts correspondant à la query
 */
async function getPosts(q, s, l, all_articles) {
    let posts = [];

    let snapshot = db.collection('posts').orderBy('uuid', 'desc');
    if(s) snapshot = snapshot.where('category_id', '==', s);
    snapshot = await snapshot.limit(l).get();

    snapshot.docs.forEach(doc => {
        let d = doc.data();

        if((!q || d.title.toLowerCase().search(q.toLowerCase()) != -1) && ((d.visible && !all_articles) || all_articles))
            posts.push({
                post: d,
                size: 0
            });
    });

    return posts;
}





/**
 * Affichage de chaque post à l'accueil du site
 * @param post Post à computer
 * @param size Taille de préférence
 * @param is_admin_link true : lien vers la modification de billets / false : lien vers l'affichage de billets
 * @return L'HTML du code à afficher
 */
function getHTMLForPostMAIN(post, size, articles, is_admin_link) {
    let html = '';
    let date = null;
    let d1   = 0;
    let d2   = 0;

    if(post.date) {
        date = new Date(post.date.toDate());
        d1   = date.getDate();
        d2   = date.getMonth();
    }


    html += '<div class="c-item';

    if(size == 2 || size == 3) html += ' c-large-2">';
    else                       html += '">';

    html += '<div class="b-image-cont">';

    if(post.image_exists) {
        html += '<img class="b-img" src="' + config.main_image_link;
        html += post.uuid + '_' + post.image_name + '?alt=media';
        html += '" />';
    }

    html += '</div><div class="b-text"><p class="b-t-title">';
    html += articles.getLabelLong(post.category_id);
    html += '</p><p class="b-t-dec"><a href="';

    if(is_admin_link) html += '/admin/edit?title=' + post.short_title + '&uuid=' + post.uuid;
    else              html += '/article?title='    + post.short_title + '&uuid=' + post.uuid;

    html += '">';
    html += post.title;
    html += '</a></p><p class="b-t-date">';
    html += 'Le ' + ((d1 + '').length == 1 ? '0' + d1 : d1) + '/' + ((d2 + '').length == 1 ? '0' + (d2 + 1) : (d2 + 1)) + '/' + (date ? date.getFullYear() : '0000');
    html += '</p></div></div>';


    return html;
}


/* ====================== */



















/* ========== AJOUT DE POSTS ========== */
/**
 * Création d'un nouveau post dans la BDD
 * @param category_id  string    : catégorie du post ['youtube', 'math', 'phys', 'info', 'other']
 * @param content      string    : contenu de l'article
 * @param date         TimeStamp : date de mise sous forme publique de l'article
 * @param description  string    : sous-titre de l'article
 * @param image_name   string    : nom de l'image 'test.png' qui sera sous '/imgs/[uuid]_[image_name]'
 * @param pref_size    int(1, 2) : préférence de taille affichée
 * @param short_title  string    : titre court sous format 'titre_court' (taille maximum: 130 charactères)
 * @param title        string    : titre complet de l'article
 * @param visible      boolean   : true si le post est visible
 * @param image_exists boolean   : true si l'image principale existe
 * @param uuid         int       : identifiant unique du post (il est conseillé de n'entrer aucune valeur)
 * @return le nouveau post généré
 */
async function addNewPost(category_id, content, date, description, image_credits, image_name, pref_size, short_title, title, visible, image_exists, uuid) {
    if(!uuid) uuid = await generateNewUUID();

    let data = {
        category_id   : category_id,
        content       : content,
        date          : date,
        description   : description,
        image_credits : image_credits,
        image_name    : image_name,
        pref_size     : pref_size,
        short_title   : short_title,
        title         : title,
        uuid          : uuid,
        visible       : visible,
        image_exists  : image_exists
    };

    let addDoc = await db.collection('posts').add(data);
    return data;
}


/* ====================== */








/* ========== MODIFICATION DE POSTS ========== */
/** Generate a new unique UUID */
async function generateNewUUID() {
    let lastUUID = await db.collection('posts').orderBy('uuid', 'desc').limit(1).get();

    if(lastUUID.docs.length == 0) return 0;
    return lastUUID.docs[0].data().uuid + 1;
}


/**
 * Edition d'un nouvel article
 * @return true si l'article a bien été édité
 */
async function editArticle(category_id, content, date, description, image_credits, image_name, pref_size, short_title, title, uuid, visible, image_exists) {
    let datas = { category_id, content, date, description, image_credits, image_name, pref_size, short_title, title, uuid, visible, image_exists };
    let dateFormatted;


    if(date == '') dateFormatted = null;
    else {
        dateFormatted = firebase.firestore.Timestamp.fromDate(new Date(date));
    }
    datas.date = dateFormatted;


    try {
        let getDoc = await db.collection('posts').where('uuid', '==', uuid).limit(1).get(); // doc correspondant à l'UUID
        let id = getDoc.docs[0].id;

        db.collection('posts').doc(id).set(datas);

        return true;
    }
    catch(e) {
        console.error('Une erreur est survenue lors de la modification d\'un article : \n', e);
        return false;
    }
}


/** Supprime un article */
async function deleteArticle(uuid) {
    let getDoc = await db.collection('posts').where('uuid', '==', parseInt(uuid)).limit(1).get(); // doc correspondant à l'UUID
    let id = getDoc.docs[0].id;

    await db.collection('posts').doc(id).delete();

    let prom = new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, 100);
    });

    await prom;
}



/** Retourne les suggestions */
async function getHTMLForSuggest(s, l, uuid) {
    let arrHTML  = [];
    let postAsso = await getPosts(undefined, s, l + 1);


       postAsso[0].size = 2;
    if(postAsso.length == 2) postAsso[1].size = 2;
    if(postAsso.length == 3) postAsso[2].size = 2;


    const articles = require('./articles');
    postAsso.forEach(el => {
        if(el.post.uuid != uuid) arrHTML.push(getHTMLForPostMAIN(el.post, el.size, articles, false));
    });


    return arrHTML;
}

/* ======================================= */






/* ========== MISE A JOUR DE L'IMAGE PRINCIPALE ========== */
const unlinkAsync = promisify(fs.unlink);

/**
 * Update de l'image principale
 * @param image L'image à Uploader
 * @param uuid L'UUID du post
 * @param image_name Nom de l'image (avec extension)
 */
async function updateMainImage(file, uuid, image_name) {
    try {
        let filePath = file.path;
        let uploadTo = 'blog/' + uuid + '_' + image_name;

        await mainBucket.upload(
            filePath, {
                destination : uploadTo,
                public      : true,
                metadata    : {
                    contentType  : mime.getType(filePath),
                    cacheControl : "public, max-age=300"
                }
            },
            function(err, file) {
                if(err) console.error('Une erreur est survenue lors de l\'upload de l\'image : \n', err);

                unlinkAsync(filePath);
            }
        );

        return true;
    }
    catch(e) {
        console.error('Une erreur est survenue lors de l\'upload de l\'image : \n', e);
        return false;
    }
}

/**
 * Update de l'image principale
 * @param uuid L'UUID du post
 * @param image_name Nom de l'image (avec extension)
 */
async function deleteMainImage(uuid, image_name) {
    try {
        let uploadTo = 'blog/' + uuid + '_' + image_name;

        await mainBucket.file(uploadTo).delete(function(err, file) {
            if(err) console.error('Une erreur est survenue lors de la suppression de l\'image : \n', err);
        });

        return true;
    }
    catch(e) {
        console.error('Une erreur est survenue lors de la suppression de l\'image : \n', e);
        return false;
    }
}



/**
 * Modification du champ image_exists
 * @param uuid UUID de l'article à l'image
 * @param bool valeur du champ
 */
async function setIsMainImage(uuid, bool) {
    try {
        let getDoc = await db.collection('posts').where('uuid', '==', parseInt(uuid)).limit(1).get(); // doc correspondant à l'UUID
        let id = getDoc.docs[0].id;

        await db.collection('posts').doc(id).update({ image_exists : bool });
        return true;
    }
    catch(e) {
        console.error('Une erreur est survenue lors de l\'upload de l\'image : \n', e);
        return false;
    }
}


/**
 * Edition du nom de l'image
 * @param uuid     UUID de l'article à l'image
 * @param old_name Ancien nom de l'image
 * @param new_name Nouveau nom de l'image
 */
async function editMainImageName(uuid, old_name, new_name) {
    await mainBucket
        .file('blog/' + uuid + '_' + old_name)
        .move('blog/' + uuid + '_' + new_name);

    return true;
}


/* ======================================= */












/** ====== FLUX RSS ====== */
/**
 * Retourne la liste des articles à publier dans le flux rss
 * @param limit Nombre d'articles maximums
 * @return [array] order by uuid
 */
async function getRssArticles(limit) {
    let snapshot = await db.collection('posts').orderBy('uuid', 'desc').where('visible', '==', true).limit(limit).get();
    return snapshot.docs;
}

/* ====================== */








/** Exports module */
module.exports = {
    initializeDb           : initializeDb,
    getHTMLForAllPostsMAIN : getHTMLForAllPostsMAIN,
    getArticleByUUID       : getArticleByUUID,
    addNewPost             : addNewPost,
    editArticle            : editArticle,
    deleteArticle          : deleteArticle,
    getRssArticles         : getRssArticles,
    getHTMLForSuggest      : getHTMLForSuggest,
    updateMainImage        : updateMainImage,
    setIsMainImage         : setIsMainImage,
    deleteMainImage        : deleteMainImage,
    editMainImageName      : editMainImageName,
    getAllPostsMAIN        : getAllPostsMAIN
};
