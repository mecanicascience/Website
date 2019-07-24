const firebase       = require('firebase-admin');
const serviceAccount = require('./../datas/private-db-key.json');
let   db;


/**
 * Initialisation de la base de données
 */
function initializeDb() {
    firebase.initializeApp({
        credential: firebase.credential.cert(serviceAccount),
        databaseURL: "https://mecanicascience.firebaseio.com"
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

/**
 * Affichage de tous les posts à l'accueil du site
 * @param q Search query      string
 * @param s Search category [ info, math, youtube, phys, other ]
 * @param l Search limit      int n articles
 * @return L'HTML du code à afficher
 */
async function getHTMLForAllPostsMAIN(q, s, l) {
    let arrHTML  = [];                      // tableau des html à afficher
    let postAsso = await getPosts(q, s, l); // liste des posts [{...}, {...}, ...]



    // === Compute each size ===
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



    // === Compute HTML array ===
    let counterSize = 0;
    let counterHTML = '<div class="container category">';

    const articles = require('./articles');
    postAsso.forEach(el => {
        counterHTML += getHTMLForPostMAIN(el.post, el.size, articles);
        counterSize += el.size;

        if(counterSize == 3) {          // si l'élément ajouté est le 3e élément
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
 * @return La liste des posts correspondant à la query
 */
async function getPosts(q, s, l) {
    let posts = [];

    let snapshot = db.collection('posts').orderBy('uuid', 'desc');
    if(s) snapshot = snapshot.where('category_id', '==', s);
    snapshot = await snapshot.limit(l).get();

    snapshot.docs.forEach(doc => {
        let d = doc.data();

        if((!q || d.title.toLowerCase().search(q.toLowerCase()) != -1) && d.visible)
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
 * @return L'HTML du code à afficher
 */
function getHTMLForPostMAIN(post, size, articles) {
    let html = '';
    let date = new Date(post.date.toDate());
    let d1   = date.getDate();
    let d2   = date.getMonth();

    html += '<div class="c-item';

    if(size == 2 || size == 3) html += ' c-large-2">';
    else                       html += '">';

    html += '<div class="b-image-cont"><img class="b-img" src="/imgs/blog/';
    html += post.uuid + '_' + post.image_name;
    html += '" /></div><div class="b-text"><p class="b-t-title">';
    html += articles.getLabelLong(post.category_id);
    html += '</p><p class="b-t-dec"><a href="';
    html += '/article?title=' + post.short_title + '&uuid=' + post.uuid;
    html += '">';
    html += post.title;
    html += '</a></p><p class="b-t-date">';
    html += 'Le ' + ((d1 + '').length == 1 ? '0' + d1 : d1) + '/' + ((d2 + '').length == 1 ? '0' + d2 : d2) + '/' + date.getFullYear();
    html += '</p></div></div>';


    return html;
}


/* ====================== */






/** Exports module */
module.exports = {
    initializeDb           : initializeDb,
    getHTMLForAllPostsMAIN : getHTMLForAllPostsMAIN,
    getArticleByUUID       : getArticleByUUID
};
