// RENDU DU CODE
function computeText(rawText) {
    let computedText = rawText;
    let datas = getFormattedRawDatas();

    for (let el in datas) computedText = replaceAll(computedText, el, datas[el]);

    return computedText;
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}





function getFormattedRawDatas() {
    let o = {
        '<link>'  : '<a style="background-color: blue;">',
        '</link>' : '</a>',
    }

    return o;
}
