const xmlbuilder = require('xmlbuilder');
const db         = require('./db');



/**
 * Génère le fichier RSS des derniers articles
 * @param website_url URL du site (avec le https / http)
 */
async function generateRSS(website_url) {
    let obj = {
        rss: {
            '@version': '2.0',
            '@xmlns:content' : 'http://purl.org/rss/1.0/modules/content/',
            '@xmlns:atom' : 'http://www.w3.org/2005/Atom',
            channel: {
                title: { '#text': 'MecanicaScience' },

                link: { '#text': website_url },
                'atom:link': {
                    '@href': website_url + '/feed/actualites.xml',
                    '@rel': 'self',
                    '@type': 'application/rss+xml'
                },

                description: { '#text': 'Blog de Maxime Dherbécourt' },
                language: { '#text': 'fr-FR' },
                copyright: { '#text': 'Copyright Maxime Dherbécourt. Tous droits réservés.' },
                author: { '#text': 'mecanicaytb@gmail.com (MecanicaScience)' },

                managingEditor: { '#text': 'mecanicaytb@gmail.com (MecanicaScience)' },
                webMaster: { '#text': 'mecanicaytb@gmail.com (MecanicaScience)' },

                image: {
                    url: website_url + '/imgs/illustration/main_logo.png',
                    title: 'Derniers articles du blog de MecanicaScience',
                    link: website_url
                },

                item : []
            }
        }
    };



    let posts = await db.getRssArticles(100);

    posts.forEach(doc => {
        let d = doc.data();
        let date = d.date;

        if(date) date = d.date.toDate();

        let item = {
            author: { '#text' : 'mecanicaytb@gmail.com (MecanicaScience)' },
            title: { '#text' : '<![CDATA[' + d.title + ']]>' },
            description: { '#text' : '<![CDATA[' + d.description + ']]>' },
            pubDate: { '#text' : '<![CDATA[' + date + ']]>' },

            category: { '#text' : formateCategory(d.category_id) },

            link: { '#text' : '<![CDATA[' + website_url + '/article?title=' + d.short_title + '&uuid=' + d.uuid+ ']]>' },

            guid: {
                '@isPermaLink' : 'true',
                '#text' : '<![CDATA[' + website_url + '/article?title=' + d.short_title + '&uuid=' + d.uuid + ']]>',
            },
            enclosure: {
                '@url': website_url + '/imgs/blog/' + d.image_name,
                '@type': 'image/jpg'
            }
        };

        obj.rss.channel.item.push(item);
    });

    let doc = xmlbuilder
        .create(obj, { encoding: 'UTF-8' })
        .end({ pretty: true})
        .toString()
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"');

    return doc;
}


/** Retourne la catégorie formatée */
function formateCategory(category_id) {
    switch (category_id) {
        case 'info':
            return 'Informatique';
        case 'math':
            return 'Mathématiques';
        case 'youtube':
            return 'Vidéo youtube';
        case 'phys':
            return 'Physique';
        case 'other':
            return 'Autre';
    }
}






module.exports = {
    generateRSS : generateRSS
}
