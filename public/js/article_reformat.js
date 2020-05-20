// RENDU DU CODE
let converter = new showdown.Converter();
function computeText(rawText) {
    let textToConvert = rawText
        .replace(/\\v\{/g, '\\overrightarrow{')
        .replace(/&#39;/g, '&&&39;')
        .replace(/<!eq>/g, '<div class="equa_imp"><div><p>Equation</p></div>')
        .replace(/<\/!eq>/g, '</div>')
    ;
    textToConvert = removeTextInEquations(textToConvert);
    textToConvert = addSummary(textToConvert);
    textToConvert = handleBalises(textToConvert);
    textToConvert = textToConvert.replace(/&&&39;/g, '\'');

    let htmlTxt = converter.makeHtml(textToConvert);
    htmlTxt = htmlTxt
        .replace(/<h1/g, '</div><div class="part_title"><h1')
        .replace(/<\/div><h1/, '<div class="part_title"><h1')
        .replace(/<\/h1>/g, '</h1></div><div class="container">')
    ;
    return putTextInEquations(htmlTxt);
}



let arrDoubleDoll = [];
let arrSimpleDoll = [];
function removeTextInEquations(txt) {
    let modifiedTxt = txt;
    let opened = false;
    let mode = 0; // 0 = dbl / 1 = simple

    let idDbl = 0;
    let idSpl = 0;

    for (let i = 0; i < modifiedTxt.length; i++) {
        if(modifiedTxt[i] == '$') {
            if(modifiedTxt[i+1] == '$') {
                modifiedTxt = replaceAtCustom(modifiedTxt, i, '▒▒');
                mode = 0;
                if(opened == true)
                    idDbl++;
                i++;
            }
            else {
                modifiedTxt = replaceAtCustom(modifiedTxt, i, '▓');
                mode = 1;
                if(opened == true)
                    idSpl++;
            }
            opened = !opened;

            continue;
        }

        if(opened == true) {
            if(mode == 0) {
                if(arrDoubleDoll[idDbl] == undefined)
                    arrDoubleDoll[idDbl] = '';
                arrDoubleDoll[idDbl] += modifiedTxt[i];
            }
            else {
                if(arrSimpleDoll[idSpl] == undefined)
                    arrSimpleDoll[idSpl] = '';
                arrSimpleDoll[idSpl] += modifiedTxt[i];
            }
            modifiedTxt = replaceAtCustom(modifiedTxt, i, '░');
        }
    }
    return modifiedTxt;
}

function putTextInEquations(txt) {
    let modifiedTxt = txt;
    let opened = false;
    let mode = 0; // 0 = dbl / 1 = simple

    let idDbl = 0;
    let idSpl = 0;
    let idCurrent = 0;

    for (let i = 0; i < modifiedTxt.length; i++) {
        if(modifiedTxt[i] == '▒') {
            idCurrent = 0;
            modifiedTxt = replaceAtCustom(modifiedTxt, i, '$$');
            mode = 0;
            if(opened == true)
                idDbl++;
            i++;
            opened = !opened;
            continue;
        }
        if(modifiedTxt[i] == '▓') {
            idCurrent = 0;
            modifiedTxt = replaceAtCustom(modifiedTxt, i, '$');
            mode = 1;
            if(opened == true)
                idSpl++;
            opened = !opened;
            continue;
        }

        if(opened == true) {
            if(mode == 0)
                modifiedTxt = replaceAtCustom(modifiedTxt, i, arrDoubleDoll[idDbl][idCurrent]);
            else
                modifiedTxt = replaceAtCustom(modifiedTxt, i, arrSimpleDoll[idSpl][idCurrent]);
            idCurrent++;
        }
    }
    return modifiedTxt;
}

function replaceAtCustom(str, index, replacement) {
    return str.substr(0, index) + replacement+ str.substr(index + replacement.length);
}



function addOptionalInitialSpace(rawText) {
    if(rawText.substring(0, 1) == '#' || rawText.substring(1, 2) == '#')
        rawText = '<p style="margin-top: -100px;"></p>' + rawText;
    return rawText;
}



function addSummary(rawText) {
    let formattedTextTmp = rawText.replace(/```([^\]]+?)```/g, '').replace(/``([^\]]+?)``/g, '').replace(/`([^\]]+?)`/g, '');

    // CREATES STRUCTURE
    let i = 0;
    let struct = [];
    while(formattedTextTmp.search(/(^)\# .*\#/m) != -1) {
        let h1Title = formattedTextTmp.split(/\#/)[1].split(/\#/)[0];
        if(h1Title != "" && h1Title.length > 0) {
            if(h1Title.split('')[1] == '!') {
                rawText = rawText.replace(h1Title,  h1Title.substring(0, 1) + h1Title.substring(2, h1Title.length));
                h1Title = '';
            }

            struct.push({ title: h1Title, content: [], shortName: h1Title.replace(/ /g, '').toLowerCase().replace(/[\.àéèüûôö:'"?!-]/g, '') });

            formattedTextTmp = formattedTextTmp.replace(/(^)\# .*\#/m, '');

            while(formattedTextTmp.split(/(^)\# /m)[0] != undefined && formattedTextTmp.split(/(^)\# /m)[0].search(/(^)\#\# .*\#\#/m) != -1) {
                let h2Title = formattedTextTmp.split(/(^)\# /m)[0].split(/\#\#/)[1].split(/\#\#/)[0];

                if(h2Title != "" && h2Title.length > 0) {
                    if(h2Title.split('')[1] == '!') {
                        rawText = rawText.replace(h2Title, h2Title.substring(0, 1) + h2Title.substring(2, h2Title.length));
                        h2Title = '';
                    }
                    struct[struct.length - 1].content.push({
                        title: h2Title,
                        content: [],
                        shortName: h2Title.replace(/ /g, '').toLowerCase().replace(/[\.àéèüûôö:'"?!-]/g, '')
                    });
                    formattedTextTmp = formattedTextTmp.replace(/(^)\#\# .*\#\#/m, '');
                }


                while(
                    formattedTextTmp.split(/(^)\# /m)[0].split(/(^)\#\# /m)[0] != undefined
                    && formattedTextTmp.split(/(^)\# /m)[0].split(/(^)\#\# /m)[0].search(/(^)\#\#\# .*\#\#\#/m) != -1
                ) {
                    let h3Title = formattedTextTmp.split(/(^)\# /m)[0].split(/(^)\#\# /m)[0].split(/\#\#\#/)[1];

                    if(h3Title != "" && h3Title.length > 0) {
                        if(h3Title.split('')[1] == '!') {
                            rawText = rawText.replace(h3Title, h3Title.substring(0, 1) + h3Title.substring(2, h3Title.length));
                            h3Title = '';
                        }
                        struct[struct.length - 1].content[struct[struct.length - 1].content.length - 1].content.push({
                            title: h3Title,
                            content: [],
                            shortName: h3Title.replace(/ /g, '').toLowerCase().replace(/[\.àéèüûôö:'"?!-]/g, '')
                        });
                        formattedTextTmp = formattedTextTmp.replace(/(^)\#\#\# .*\#\#\#/m, '');
                    }
                }
            }
        }
    }

    // STRUCTURE => HTML
    let addedHTML = "";

    if(struct.length != 0) {
        addedHTML = '<p style="margin-top: -100px;"></p>';
        addedHTML += '<ul>';
        for (let h1 = 0; h1 < struct.length; h1++) {
            if(struct[h1].title != '')
                addedHTML += `<div><li><a href="#${struct[h1].shortName}">${struct[h1].title}</a></li>`;

            for (let h2 = 0; h2 < struct[h1].content.length; h2++) {
                if(h2 == 0) addedHTML += '<div><ul>';
                if(struct[h1].content[h2].title != '')
                    addedHTML += `<li><a href="#${struct[h1].content[h2].shortName}">${struct[h1].content[h2].title}</a></li>`;

                for (let h3 = 0; h3 < struct[h1].content[h2].content.length; h3++) {
                    if(h3 == 0) addedHTML += '<ul>';

                    if(struct[h1].content[h2].content[h3].title != '')
                        addedHTML += `<li><a href="#${struct[h1].content[h2].content[h3].shortName}">${struct[h1].content[h2].content[h3].title}</a></li>`;

                    if(h3 == struct[h1].content[h2].content.length - 1) addedHTML += '</ul>';
                }

                if(h2 == struct[h1].content.length - 1) addedHTML += '</ul></div>';
            }

            addedHTML += '</div>';
        }
        addedHTML += '</ul><p style="margin-top: 90px;"></p>';
    }

    return addedHTML + '\n' + rawText;
}


function handleBalises(rawText) {
    // PANELS
    let formattedText = rawText
        .replace(/<\/panel>/g, '</p></div>')
        .replace(/<panel type=info>/g,    getPanelHtml('info'))
        .replace(/<panel type=warning>/g, getPanelHtml('warning'))
        .replace(/<panel type=danger>/g,  getPanelHtml('danger'))
    ;


    // IFRAME
    while(formattedText.search(/<embeddedFrame.*\/>/) != -1) {
        let frameDesc = formattedText.split('<embeddedFrame ')[1].split('/>')[0];
        let src = frameDesc.split('src=\'')[1].split('\'')[0];
        let link = frameDesc.split('link=\'')[1].split('\'')[0];

        let title1 = frameDesc.split('title=\'');
        let title = (title1[1] != undefined && (title1[1].split('\'')).length > 0)
            ? 'Simulation - ' + title1[1].split('\'')[0]
            : 'Simulation';

        let text1 = frameDesc.split('text=\'');
        let text = (text1[1] != undefined && (text1[1].split('\'')).length > 0)
            ? text1[1].split('\'')[0]
            : '';

        let formatedHTMLT = getIframeHTML(src, link, title, text);

        formattedText = formattedText.replace(/<embeddedFrame.*?\/>/, formatedHTMLT);
    }


    return formattedText.replace(/\\"/g, '"');
}

function getPanelHtml(type) {
    return `<div class="panel-m panel-${type}-m"><div></div><p>`;
}

function getIframeHTML(src, link, title, text) {
    let id = Math.round(Math.random() * 1000000000000);
    let html = `<figure class="custom-code-d">`
        + `<div class="custom-code-d-title">`
            + `<p>${title}</p>`
        + `</div>`
        + `<iframe src="${link}" class="code-iframe-i" id="${id}"></iframe>`
        + `<div class="custom-code-d-text">`
            + `<p>${text}</p>`
        + `</div>`
        + `<div class="custom-code-buttons" style="text-align: center;">`
            + `<button style="margin-right: 5px;" type="button" onclick="window.open('${src}', '_blank');" class="btn btn-outline-secondary">Voir le code source</button>`
            + `<button type="button" onclick="document.getElementById('${id}').src='${link}'" class="btn btn-outline-danger">Remettre à zéro</button>`
        + `</div>`
        + `</figure>`
    ;

    return html;
}
