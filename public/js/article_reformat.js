// RENDU DU CODE
let converter = new showdown.Converter();
function computeText(rawText) {
    return converter.makeHtml(handleBalises(rawText));
}


function handleBalises(rawText) {
    let formattedText = rawText
        .replace(/<\/panel>/g, '</p></div>')
        .replace(/<panel type=info>/g,    getPanelHtml('info'))
        .replace(/<panel type=warning>/g, getPanelHtml('warning'))
        .replace(/<panel type=danger>/g,  getPanelHtml('danger'))
    ;

    return formattedText;
}

function getPanelHtml(type) {
    return `<div class="panel-m panel-${type}-m"><p>`;
}
