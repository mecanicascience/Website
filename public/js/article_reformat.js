// RENDU DU CODE
let converter = new showdown.Converter();
function computeText(rawText) {
    return converter.makeHtml(rawText);
}
