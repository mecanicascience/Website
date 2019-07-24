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
  * @return array pour chaque ligne d'articles ['<div><div>Article 1</div><div>Article 2</div><div>Article 3</div></div>', ...]
  */
async function getArticles(q, s, l) {
    if(!l) l = 20;
    let html_array = await db.getHTMLForAllPostsMAIN(q, s, l);

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



// Retourne le label à afficher à l'accueil du site pour chaque query
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
    let date = new Date(article.date.toDate());
    let d1   = date.getDate();
    let d2   = date.getMonth();

    article.formatted_date     = ((d1 + '').length == 1 ? '0' + d1 : d1) + '/' + ((d2 + '').length == 1 ? '0' + d2 : d2) + '/' + date.getFullYear();
    article.formatted_category = getLabelLong(article.category_id);

    return article;
}


/**
  * @param uuid  uuid de l'article recherché
  * @param title titre short de l'article
  * @return false ou l'article
  */
async function articleExists(uuid, title) {
    let articleList = await db.getArticleByUUID(uuid);

    if(articleList.docs.length != 1) return false;
    else {
        let article = articleList.docs[0].data();
        if(article.short_title == title) return article;
        else                             return false;
    }
}










/* ====== SERVER ====== */
module.exports = {
    getArticles     : getArticles,
    getLabel        : getLabel,
    getActionLink   : getActionLink,
    getLabelLong    : getLabelLong,
    getArticleDatas : getArticleDatas,
    articleExists   : articleExists
};
