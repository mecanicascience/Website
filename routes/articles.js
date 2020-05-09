/*
 *  GET ALL ARTICLES BY QUERY OR CATEGORY
 */

/* ====== DEPENDANCIES ====== */
const db = require('./db')




/* ====== APP ====== */
/**
  * Retourne le code HTML brut à afficher
  * @param q Search query    [ string ]                           : default 'undefined'
  * @param s Search category [ info, math, youtube, phys, other ] : default 'undefined'
  * @param l Search limit    [ int n articles ]                   : default  20
  * @param is_admin_link     true : lien vers la modification de billets / false : lien vers l'affichage de billets
  * @param all_articles      true : affichage de tous les articles, même s'ils ne sont pas visibles
  * @return array pour chaque ligne d'articles ['<div><div>Article 1</div><div>Article 2</div><div>Article 3</div></div>', ...]
  */
async function getArticles(q, s, l, is_admin_link, all_articles) {
    if(!all_articles) all_articles = false;

    if(!l) l = 20;
    let html_array = await db.getHTMLForAllPostsMAIN(q, s, l, is_admin_link, all_articles);

    if(html_array.length == 0) {
        let cHtml = [ '<div class="container category c-large-2" style="flex-direction: column;text-align: center;"><b>Aucun article</b> ' ];

             if(!q && !s) cHtml[0] += 'n\'a été publié par l\'auteur pour le moment.<br />Merci de patienter !';
        else if( q && !s) cHtml[0] += 'ne correspond à la recherche.';
        else if(!q &&  s) cHtml[0] += 'n\'a encoré été publié dans cette catégorie.';
        else if( q &&  s) cHtml[0] += 'ne correspond à la catégorie et à la recherche.';

        cHtml[0] += '</div>';

        return cHtml;
    }

    return html_array;
}



/** Retourne l'url de tous les articles pour le sitemap */
async function getArticlesUrl(main_url) {
    let html_array = await db.getAllPostsMAIN();
    let arr = [];

    for (let i = 0; i < html_array.length; i++)
        arr.push({ url: main_url + '/article/' + html_array[i].post.short_title + '&articleview&' + html_array[i].post.uuid });

    return arr;
}



/** Retourne le label à afficher à l'accueil du site pour chaque query */
function getLabel(q, s, l, articlesLen) {
    let text = [];
    let cat = '';

    if(!l) l = 20;
    if(s) cat = getLabelLong(s);

    if(!q && !s) text.push('Affichage des derniers articles') + text.push('dans l\'ordre de dernière publication');
    if( q && !s) text.push('Affichage des articles ')         + text.push('correspondant à \'' + q + '\'');
    if(!q &&  s) text.push('Affichage des articles de')       + text.push('la catégorie ' + cat);
    if( q &&  s) text.push('Affichage des articles de')       + text.push('la catégorie ' + cat) + text.push(' correspondant à \'' + q + '\'');

    if(articlesLen > l) text.push('dans une limite de ' + l + ' articles maximums');

    return text;
}

// Retourne le label développé
function getLabelLong(s) {
    switch (s) {
        case 'mecanique':
            return 'mécanique';
        case 'electromag':
            return 'electromagnétisme';
        case 'youtube':
            return 'vidéos youtube';
        case 'optique':
            return 'optique';
        case 'maths':
            return 'mathématiques';
        case 'autre':
            return 'autres articles';
    }
}




// Lien d'action
function getActionLink(q, s) {
    if(s) return '/?s=' + s;
    else  return '/';
}






/** ====== VISUALISATION D'UN ARTICLE ====== */
/**
  * @param article L'article
  * @return un object représentant les datas à afficher
  */
function getArticleDatas(article) {
    article.formatted_category = getLabelLong(article.category_id);

    if(!article.date) {
        article.formatted_date = '\'pas de date spécifiée\'';
        return article;
    }

    let date = new Date(article.date.toDate());
    let d1   = date.getDate();
    let d2   = date.getMonth();

    article.formatted_date = ((d1 + '').length == 1 ? '0' + d1 : d1) + '/' + ((d2 + '').length == 1 ? '0' + d2 : d2) + '/' + date.getFullYear();

    return article;
}


/**
  * @param uuid     uuid de l'article recherché
  * @param title    titre short de l'article
  * @param is_admin true si l'utilisateur est administrateur
  * @return false si l'article n'existe pas ou n'est pas visible ou l'article
  */
async function articleExistsAndVisible(uuid, title, is_admin) {
    let articleList = await db.getArticleByUUID(uuid);

    if(articleList.docs.length != 1) return false;
    else {
        let article = articleList.docs[0].data();
        if(article.short_title == title && ((article.visible && !is_admin) || is_admin)) return article;
        else                                                                             return false;
    }
}








/* ====== CREATION ET MODIFICATION DES ARTICLES ====== */
/* Création d'un nouvel article */
async function createNewArticle() {
    let new_article = await db.addNewPost('null', 'null', null, 'null', 'null', 'null.png', 1, 'null', 'null', false, false, 0, [], []);
    return new_article;
}

/* Modification d'un article */
async function editArticle(category_id, content, date, description, image_credits, image_name, pref_size, short_title, title, uuid, visible, image_exists, author) {
    if(
        isNaN(pref_size) || isNaN(uuid) || (visible != 'true' && visible != 'false')
    ) return false;

    let answer = await db.editArticle(category_id, content, date, description, image_credits, image_name, parseInt(pref_size), short_title, title, parseInt(uuid), (visible == 'true' ? true : false), (image_exists == 'true' ? true : false), author);
    return answer;
}

/* Supprime l'article avec l'UUID */
async function deleteArticle(uuid) {
    try {
        await db.deleteArticle(uuid);
        return true;
    }
    catch(e) {
        console.error('Erreur en essayant de supprimer l\'article à l\'uuid ' + uuid + ' :\n', e);
        return false;
    }
}




/** Retourne les articles de suggestion */
async function getArticlesForSuggestions(s, l, uuid) {
    let html_array = await db.getHTMLForSuggest(s, l, parseInt(uuid));
    return html_array;
}





/** Mise à jour de l'image principale de l'article */
async function updateMainImage(req, image, uuid, image_name) {
    // si pas d'image
    if(!uuid || !image_name || !req.file) return false;


    // stockage de l'image (firebase)
    let answer = await db.updateMainImage(req.file, uuid, image_name);

    if(answer) answer = await db.setIsMainImage(uuid, true);
    return answer;
}

/** Suppression de l'image principale de l'article */
async function deleteMainImage(uuid, image_name) {
    if(!uuid || !image_name) return false;

    let answer = await db.deleteMainImage(uuid, image_name);

    if(answer) answer = await db.setIsMainImage(uuid, false);
    return answer;
}




/** Retourne la liste des projets sous forme spécifique de l'année en paramètres */
async function getMonthlyProjectsForYear(year) {
    let finalArr    = {};
    let jsonYearArr = await db.getJsonForYear(year);

    if(jsonYearArr == undefined || jsonYearArr.months == undefined)
        return finalArr;
    else
        jsonYearArr = jsonYearArr.months;

    for (let i = 0; i < jsonYearArr.length; i++) {
        let formatedI = "0" + (i + 1);
        if(i + 1 >= 10)
            formatedI = (i + 1) + "";

        finalArr[formatedI] = jsonYearArr[i];
    }

    return finalArr;
}

/** Ajoute une vue sur un article pour l'ip donnée */
async function addViewForArticle(datas, ip, isConnected) {
    await db.addViewForArticle(datas, ip, isConnected);
}




/** Ajoute un commentaire en fonction de la requête */
async function postComment(dat, ip) {
    if(
           !dat['c-a-id'] || parseInt(dat['c-a-id']) < 0 || !dat['c-a-title']
        || !dat['c-email'] || !dat['c-commentary'] || !dat['c-name']
    ) return 1;

    if(!validateEmail(dat['c-email']))
        return 2;

    if(dat['c-commentary'].length > 4000)
        return 3;

    let ans = await db.addNewComment(parseInt(dat['c-a-id']), dat['c-a-title'], dat['c-name'], dat['c-email'], dat['c-commentary'], ip);
    return ans;
}

/** @return a list of every comments */
async function getEveryComments() {
    let ans = await db.getEveryComments();
    return ans;
}

/**
* @param email
* @return true if the email is valid
*/
function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

/**
* @param comment User comments
* @param adminView Is the user an administrator
* @return a formated list of the comments
*/
function formatComment(comments, adminView = false) {
    let arrRet = [];

    for (let i = 0; i < comments.length; i++) {
        let c = comments[i];

        if(!adminView && !c.visible)
            continue;

        let date = new Date(c.post_date.toDate());
        let d1   = date.getDate();
        let d2   = date.getMonth();
        let d3   = date.getHours();
        let d4   = date.getMinutes();

        let f_date =
            'Le ' +
            ((d1 + '').length == 1 ? '0' + d1 : d1) + '/' + ((d2 + '').length == 1 ? '0' + d2 : d2) + '/' + date.getFullYear()
            + ' à ' + ((d3 + '').length == 1 ? '0' + d3 : d3) + 'h' + ((d4 + '').length == 1 ? '0' + d4 : d4);
        ;


        arrRet.push({
            name    : c.name,
            comment : c.comment,
            date    : f_date,
            email   : c.email,
            ip      : c.ip,
            visible : c.visible,
            //
            articleTitle : c.articleTitle,
            articleID    : c.articleID,
            commentID    : c.commentID,
        });
    }

    return arrRet.reverse();
}

/**
* Changes the visibility of an article
*/
async function toggleArticleVisibility(articleID, commentID) {
    let ans = await db.toggleArticleVisibility(articleID, commentID);
    if(ans)
        return 10;
    else
        return 11;
}





/** @return a list of every simulations */
async function getSimulations(isConnected) {
    let ans = await db.getSimulations(isConnected);
    return ans;
}

/**
  * @param uuid     uuid de la simulation
  * @param type     catégorie de la simulation
  * @param title    titre short de la simulation
  * @param is_admin true si l'utilisateur est administrateur
  * @return false si la simulation n'existe pas (ou n'est pas visible) ou l'article
  */
async function simulationExistsAndVisible(uuid, type, title, is_admin) {
    let simulationList = await db.getSimulationByUUID(uuid);

    if(simulationList.docs.length != 1) return false;
    else {
        let simulation = simulationList.docs[0].data();
        if(simulation.type == type && simulation.short_title == title && ((simulation.visible && !is_admin) || is_admin))
            return simulation;
        else
            return false;
    }
    return false;
}

/**
  * @param simulation
  * @return the simulation datas if the simulation exists
  */
async function getSimulationDatas(simulation) {
    simulation.formatted_type = getLabelLong(simulation.type);

    if(!simulation.date) {
        simulation.formatted_date = '\'pas de date spécifiée\'';
        return simulation;
    }

    let date = new Date(simulation.date.toDate());
    let d1   = date.getDate();
    let d2   = date.getMonth();

    simulation.formatted_date = ((d1 + '').length == 1 ? '0' + d1 : d1) + '/' + ((d2 + '').length == 1 ? '0' + d2 : d2) + '/' + date.getFullYear();

    return simulation;
}








/* ====== SERVER ====== */
module.exports = {
    getArticles                : getArticles,
    getLabel                   : getLabel,
    getActionLink              : getActionLink,
    getLabelLong               : getLabelLong,
    getArticleDatas            : getArticleDatas,
    articleExistsAndVisible    : articleExistsAndVisible,
    createNewArticle           : createNewArticle,
    editArticle                : editArticle,
    deleteArticle              : deleteArticle,
    getArticlesForSuggestions  : getArticlesForSuggestions,
    updateMainImage            : updateMainImage,
    deleteMainImage            : deleteMainImage,
    getArticlesUrl             : getArticlesUrl,
    getMonthlyProjectsForYear  : getMonthlyProjectsForYear,
    addViewForArticle          : addViewForArticle,
    postComment                : postComment,
    formatComment              : formatComment,
    getEveryComments           : getEveryComments,
    toggleArticleVisibility    : toggleArticleVisibility,
    getSimulations             : getSimulations,
    simulationExistsAndVisible : simulationExistsAndVisible,
    getSimulationDatas         : getSimulationDatas
};
