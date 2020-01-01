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
        arr.push({ url: main_url + '/article?title=' + html_array[i].post.short_title + '&uuid=' + html_array[i].post.uuid });

    return arr;
}



/** Retourne le label à afficher à l'accueil du site pour chaque query */
function getLabel(q, s, l, articlesLen) {
    let text = [];
    let cat = '';

    if(!l) l = 20;
    if(s) cat = getLabelLong(s);

    if(!q && !s) text.push('Affichage des derniers articles') + text.push('dans l\'ordre de dernière publication');
    if( q && !s) text.push('Affichage des articles ') + text.push('correspondant à \'' + q + '\'');
    if(!q &&  s) text.push('Affichage des articles de') + text.push('la catégorie ' + cat);
    if( q &&  s) text.push('Affichage des articles de') + text.push('la catégorie ' + cat) + text.push(' correspondant à \'' + q + '\'');

    if(articlesLen > l) text.push('dans une limite de ' + l + ' articles maximums');

    return text;
}

// Retourne le label développé
function getLabelLong(s) {
    switch (s) {
        case 'info':
            return 'informatique';
        case 'math':
            return 'mathématiques';
        case 'youtube':
            return 'vidéos youtube';
        case 'phys':
            return 'physique';
        case 'other':
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
    let new_article = await db.addNewPost('null', 'null', null, 'null', 'null', 'null.png', 1, 'null', 'null', false, false);
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








/* ====== SERVER ====== */
module.exports = {
    getArticles               : getArticles,
    getLabel                  : getLabel,
    getActionLink             : getActionLink,
    getLabelLong              : getLabelLong,
    getArticleDatas           : getArticleDatas,
    articleExistsAndVisible   : articleExistsAndVisible,
    createNewArticle          : createNewArticle,
    editArticle               : editArticle,
    deleteArticle             : deleteArticle,
    getArticlesForSuggestions : getArticlesForSuggestions,
    updateMainImage           : updateMainImage,
    deleteMainImage           : deleteMainImage,
    getArticlesUrl            : getArticlesUrl,
    getMonthlyProjectsForYear : getMonthlyProjectsForYear
};
