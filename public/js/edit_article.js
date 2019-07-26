function changeButtonText() {
    let el = document.getElementById('publish-status-text');

    if(el.val == '0') {
        el.val = '1';
        el.innerHTML = "L'article ne sera pas / n'est pas publié";
    }
    else {
        el.val = '0';
        el.innerHTML = "L'article sera / est publié";
    }
}


function setAjdButton() {
    let ajd = new Date();
    let d1 = ajd.getDate();
    let d2 = ajd.getMonth();

    document.getElementById('date-publi').value = ajd.getFullYear() + '-' + ((d2 + '').length == 1 ? '0' + d2 : d2) + '-' + ((d1 + '').length == 1 ? '0' + d1 : d1);
}



function showPostRender() {
    document.getElementById('preview-toaster-content').innerHTML = computeText(document.getElementById('content-area').value);

    MathJax.Hub.Queue(["Typeset",MathJax.Hub]);

    document.getElementById('preview-toaster-content').style.maxHeight = document.body.clientHeight - 0.1 * document.body.clientHeight + 'px';
    document.getElementById('preview-toaster-sm').style.marginTop = 0.05 * document.body.clientHeight + 'px';

    document.getElementById('preview-toaster').style.opacity = 0;
    document.getElementById('preview-toaster').style.display = 'block';

    setTimeout(function() {
        document.getElementById('preview-toaster').style.opacity = 1;
    }, 100);



    document.getElementById('fade-in-dropper').style.opacity = 0;
    document.getElementById('fade-in-dropper').style.display = 'block';

    setTimeout(function() {
        document.getElementById('fade-in-dropper').style.opacity = 0.5;
    }, 100);
}


function showShortcuts() {
    document.getElementById('preview-toaster-content').innerHTML = document.getElementById('balises_description').innerHTML;

    MathJax.Hub.Queue(["Typeset",MathJax.Hub]);

    document.getElementById('preview-toaster-content').style.maxHeight = document.body.clientHeight - 0.1 * document.body.clientHeight + 'px';
    document.getElementById('preview-toaster-sm').style.marginTop = 0.05 * document.body.clientHeight + 'px';

    document.getElementById('preview-toaster').style.opacity = 0;
    document.getElementById('preview-toaster').style.display = 'block';

    setTimeout(function() {
        document.getElementById('preview-toaster').style.opacity = 1;
    }, 100);



    document.getElementById('fade-in-dropper').style.opacity = 0;
    document.getElementById('fade-in-dropper').style.display = 'block';

    setTimeout(function() {
        document.getElementById('fade-in-dropper').style.opacity = 0.5;
    }, 100);
}





function textAreaAdjust(o) {
    o.style.height = "1px";
    o.style.height = (25 + o.scrollHeight) + "px";
}




function deleteArticle() {
    document.getElementById('deleteModal').style.opacity = 0;
    document.getElementById('deleteModal').style.display = 'unset';

    setTimeout(function() {
        document.getElementById('deleteModal').style.opacity = 1;
    }, 100);



    document.getElementById('fade-in-dropper').style.opacity = 0;
    document.getElementById('fade-in-dropper').style.display = 'unset';

    setTimeout(function() {
        document.getElementById('fade-in-dropper').style.opacity = 0.5;
    }, 100);
}

function closePopup(id) {
    document.getElementById(id).style.opacity = 0;
    document.getElementById(id).style.opacity = 0;
    setTimeout(function() {
        document.getElementById(id).style.display = 'none';
    }, 70);


    document.getElementById('fade-in-dropper').style.opacity = 0;
    setTimeout(function() {
        document.getElementById('fade-in-dropper').style.display = 'none';
    }, 70);

}






const MAX_SHORT_TITLE_LENGTH = 130;

let lastTitle = '';
function setLastTitle(title) { lastTitle = title; }

function checkSucess(category_id, content, date, description, image_name, pref_size, short_title, title, uuid, visible, button_id) {
    let shouldRedirect = false;
    if(title != lastTitle) {
        shouldRedirect = true;
        short_title = title.toLowerCase().replace(/ /g, '_').substring(0, MAX_SHORT_TITLE_LENGTH);
        if(short_title[short_title.length - 1] == '_') short_title = short_title.substring(0, short_title.length - 1);
    }

    postNewDatas(category_id, content, date, description, image_name, pref_size, short_title, title, uuid, visible, lastTitle, shouldRedirect, button_id);
}


function postNewDatas(category_id, content, date, description, image_name, pref_size, short_title, title, uuid, visible, lastTitle, shouldRedirect, button_id) {
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            let answer;

            if(this.status == 200) {
                answer = JSON.parse(this.responseText);
            }
            else {
                answer = { error: 1 };
            }

            continueOperation((answer.error == 0 ? true : false), shouldRedirect, short_title, uuid, button_id);
        }
    };

    xhttp.open("POST", "/admin/update", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(`category_id=${category_id}&content=${content}&date=${date}&description=${description}&image_name=${image_name}&pref_size=${pref_size}&short_title=${short_title}&title=${title}&uuid=${uuid}&visible=${visible}`);
}


function continueOperation(success, shouldRedirect, short_title, uuid, button_id) {
    if(success && shouldRedirect) {
        setTimeout(function() {
            window.location.href = '/admin/edit?title=' + short_title + '&uuid=' + uuid;
        }, 1000);
    }

    onPublishModifsDone(success, button_id);
}


function onPublishModifsDone(success, button_id) {
    let button_iden = button_id == 1 ? 'publish-modifs' : 'publish-modifs-2';

    if(success) {
        document.getElementById('info-toast').style.height = '91.5px';

        document.getElementById('toast-message').innerHTML = 'Sauvegarde effectuée.';
        document.getElementById(button_iden).className = 'btn btn-outline-success';
        document.getElementById('info-toast').style.opacity = 1;

        setTimeout(function() {
            document.getElementById(button_iden).className = 'btn btn-outline-secondary';
        }, 2500);

        setTimeout(function() {
           document.getElementById('info-toast').style.opacity = 0;
        }, 2500);
    }
    else {
        document.getElementById('info-toast').style.height = '110.5px';

        document.getElementById('toast-message').innerHTML = 'Erreur lors de la sauvegarde. Veuillez réessayer.';
        document.getElementById(button_iden).className = 'btn btn-outline-danger';
        document.getElementById('info-toast').style.opacity = 1;

        setTimeout(function() {
           document.getElementById('info-toast').style.height = '110.5px';
       }, 10);

        setTimeout(function() {
            document.getElementById(button_iden).className = 'btn btn-outline-secondary';
        }, 2500);

        setTimeout(function() {
           document.getElementById('info-toast').style.opacity = 0;
        }, 2500);
    }
}






function convertToHtmlCode(text) {
    let output = '';
    for (let i = 0; i < text.length; i++) {
        output += text.charCodeAt(i) + '_';
    }

    return output;
}

function convertFromCodeToHtml(nb) {
    let last = '';
    let renderVal = '';

    for (let i = 0; i < nb.length; i++) {
        if(nb[i] == '_') {
            renderVal += String.fromCharCode(parseInt(last));
            last = '';
        }
        else last += nb[i];
    }

    return renderVal;
}









function computeText(rawText) {
    let computedText = '';


    return rawText;
}
