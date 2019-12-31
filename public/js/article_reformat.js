// RENDU DU CODE
let converter = new showdown.Converter();
function computeText(rawText) {
    return converter.makeHtml(handleBalises(rawText));
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
        let formatedHTMLT = getIframeHTML(src, link);

        formattedText = formattedText.replace(/<embeddedFrame.*?\/>/, formatedHTMLT);
    }


    return formattedText.replace(/\\"/g, '"');
}

function getPanelHtml(type) {
    return `<div class="panel-m panel-${type}-m"><p>`;
}

function getIframeHTML(src, link) {
    let id = Math.round(Math.random() * 1000000000000);
    let html = `<div class="custom-code-d">`
        + `<iframe src="${link}" class="code-iframe-i" id="${id}"></iframe>`
        + `<div class="custom-code-buttons" style="text-align: center;">`
            + `<button type="button" onclick="window.open('${src}', '_blank');" class="btn btn-outline-secondary">Voir le code source</button>`
            + `<button type="button" onclick="document.getElementById('${id}').src='${link}'" class="btn btn-outline-danger">Remettre à zéro</button>`
        + `</div>`
        + `</div>`
    ;

    return html;
}
