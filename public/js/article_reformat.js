// RENDU DU CODE
let converter = new showdown.Converter();
function computeText(rawText) {
    hljs.initHighlighting.called = false;
    hljs.initHighlighting();

    return converter.makeHtml(rawText);
}
