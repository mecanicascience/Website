// RENDU DU CODE
let converter = new showdown.Converter();
function computeText(rawText) {
    hljs.initHighlightingOnLoad();

    return converter.makeHtml(rawText);
}
