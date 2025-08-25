const xmlbuilder = require('xmlbuilder');
const db         = require('./db');



/**
 * Génère le fichier RSS des derniers articles
 * @param website_url URL du site (avec le https / http)
 */
async function generateRSS(website_url, blogLink) {
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

                description: { '#text': 'Blog de MecanicaScience' },
                language: { '#text': 'fr-FR' },
                copyright: { '#text': 'Copyright MecanicaScience. Tous droits réservés.' },
                author: { '#text': 'mecanicascience@gmail.com (MecanicaScience)' },

                managingEditor: { '#text': 'mecanicascience@gmail.com (MecanicaScience)' },
                webMaster: { '#text': 'mecanicascience@gmail.com (MecanicaScience)' },

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
            author: { '#text' : d.author },
            title: { '#text' : '<![CDATA[' + d.title + ']]>' },
            description: { '#text' : '<![CDATA[' + d.description + ']]>' },
            pubDate: { '#text' : '<![CDATA[' + date + ']]>' },

            category: { '#text' : formateCategory(d.category_id) },

            link: { '#text' : '<![CDATA[' + website_url + '/article/' + d.short_title + '&articleview&' + d.uuid+ ']]>' },

            guid: {
                '@isPermaLink' : 'true',
                '#text' : '<![CDATA[' + website_url + '/article/' + d.short_title + '&articleview&' + d.uuid + ']]>',
            },
            enclosure: {
                '@url': blogLink + d.uuid + '_' + d.image_name + '?alt=media',
                '@type': 'image/jpg'
            }
        };

        obj.rss.channel.item.push(item);
    });
    let itemGeneralRelativity = {
        author: { '#text' : 'Maxime Dherbécourt' },
        title: { '#text' : '<![CDATA[Exploring General Relativity]]>' },
        description: { '#text' : '<![CDATA[An article that goes through the principles of general relativity.]]>' },
        pubDate: { '#text' : '<![CDATA[2023-08-14]]>' },
        category: { '#text': 'Physics' },
        link: { '#text' : '<![CDATA[https://mecanicascience.fr/articles/exploring_general_relativity_part_1]]>' },
        guid: {
            '@isPermaLink' : 'true',
            '#text' : '<![CDATA[https://mecanicascience.fr/articles/exploring_general_relativity_part_1]]>',
        },
        enclosure: {
            '@url': 'https://mecanicascience.fr/general_relativity.png',
            '@type': 'image/png'
        }
    };
    obj.rss.channel.item.push(itemGeneralRelativity);

    let itemScienceOfComplexity = {
        author: { '#text': 'Maxime Dherbécourt' },
        title: { '#text' : '<![CDATA[The Science of Complexity]]>' },
        description: { '#text' : '<![CDATA[An article about the science of complexity, going from how magnets works to how fish and fireflies synchronize.]]>' },
        pubDate: { '#text' : '<![CDATA[2025-08-25]]>' },
        category: { '#text' : 'Physics' },
        link: { '#text' : '<![CDATA[https://mecanicascience.fr/articles/science_of_complexity]]>' },
        guid: {
            '@isPermaLink' : 'true',
            '#text' : '<![CDATA[https://mecanicascience.fr/articles/science_of_complexity]]>',
        },
        enclosure: {
            '@url': 'https://mecanicascience.fr/images/science_of_complexity.png',
            '@type': 'image/png'
        }
    };
    obj.rss.channel.item.push(itemScienceOfComplexity);

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
