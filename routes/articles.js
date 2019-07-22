/*
 *  GET ALL ARTICLES BY QUERY OR CATEGORY
 */

/* ====== DEPENDANCIES ====== */
// const a = a;




/* ====== APP ====== */
/**
  * Return all articles by query
  * @param q Search query    [ string ]                           : default 'undefined'
  * @param s Search category [ info, math, youtube, phys, other ] : default 'undefined'
  * @param l Search limit    [ int n articles ]                   : default  20
  * @return array [{ category: 'category', name: 'name', date: '00/00/0000' }, {...}, ...]
  */
function getArticles(q, s, l) {
    if(!l) l = 20;

    console.log(q, s, l);
    return [];
}



// Retourne le label à afficher
function getLabel(q, s, l) {
    let text = [];
    let cat = '';
    if(!l) l = 20;

    if(s) {
        switch (s) {
            case 'info':
                cat = 'informatique';
                break;
            case 'math':
                cat = 'mathématiques';
                break;
            case 'youtube':
                cat = 'vidéos youtube';
                break;
            case 'phys':
                cat = 'physique';
                break;
            case 'other':
                cat = 'autres articles';
                break;
        }
    }

    if(!q && !s) text.push('Affichage des derniers articles') + text.push('dans l\'ordre de dernière publication');
    if( q && !s) text.push('Affichage des articles ') + text.push('correspondant à \'' + q + '\'');
    if(!q &&  s) text.push('Affichage des articles de') + text.push('la catégorie ' + cat);
    if( q &&  s) text.push('Affichage des articles de') + text.push('la catégorie ' + cat) + text.push(' correspondant à \'' + q + '\'');

    if(getArticles(q, s, l).length > l) text.push('dans une limite de ' + l + ' articles maximums');

    return text;
}




/* ====== SERVER ====== */
module.exports = {
    getArticles : getArticles,
    getLabel    : getLabel
};
