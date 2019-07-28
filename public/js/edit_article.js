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


function getBalisesDescription() {
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            if(this.status == 200) {
                document.getElementById('balises_description').value = this.responseText;
            }
        }
    };

    xhttp.open("GET", "/other/balises_description.txt", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send('');
}






function setAjdButton() {
    let ajd = new Date();
    let d1 = ajd.getDate();
    let d2 = ajd.getMonth();

    document.getElementById('date-publi').value = ajd.getFullYear() + '-' + ((d2 + '').length == 1 ? '0' + d2 : d2) + '-' + ((d1 + '').length == 1 ? '0' + d1 : d1);
}



function showPostRender() {
    document.getElementById('preview-toaster-content').innerHTML = computeText(document.getElementById('content-area').value);

    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);

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
    document.getElementById('preview-toaster-content').innerHTML = computeText(document.getElementById('balises_description').value);

    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);

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
    o.style.height = (55 * 5 + o.scrollHeight) + "px";
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


function addMainImagePopup() {
    document.getElementById('main-image-toaster').style.opacity = 0;
    document.getElementById('main-image-toaster').style.display = 'unset';

    setTimeout(function() {
        document.getElementById('main-image-toaster').style.opacity = 1;
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

function checkSucess(category_id, content, date, description, image_name, pref_size, short_title, title, uuid, visible, button_id, image_exists, lastImageName) {
    let shouldRedirect = false;
    if(title != lastTitle) {
        shouldRedirect = true;
        short_title = title.toLowerCase().replace(/ /g, '_').substring(0, MAX_SHORT_TITLE_LENGTH);
        if(short_title[short_title.length - 1] == '_') short_title = short_title.substring(0, short_title.length - 1);
    }

    postNewDatas(category_id, content, date, description, image_name, pref_size, short_title, title, uuid, visible, lastTitle, shouldRedirect, button_id, image_exists, lastImageName);
}


function postNewDatas(category_id, content, date, description, image_name, pref_size, short_title, title, uuid, visible, lastTitle, shouldRedirect, button_id, image_exists, lastImageName) {
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
    xhttp.send(`category_id=${category_id}&content=${content}&date=${date}&description=${description}&image_name=${image_name}&pref_size=${pref_size}&short_title=${short_title}&title=${title}&uuid=${uuid}&visible=${visible}&image_exists=${image_exists}&lastImageName=${lastImageName}`);
}


function continueOperation(success, shouldRedirect, short_title, uuid, button_id) {
    if(success && shouldRedirect) {
        setTimeout(function() {
            window.location.href = '/admin/edit?title=' + short_title + '&uuid=' + uuid;
        }, 1000);
    }

    onPublishModifsDone(success, button_id, uuid);
}


function onPublishModifsDone(success, button_id, uuid) {
    let button_iden = button_id == 1 ? 'publish-modifs' : 'publish-modifs-2';

    if(success) {
        document.getElementById('info-toast').style.height = '91.5px';

        document.getElementById('toast-message').innerHTML = 'Sauvegarde effectuée.';
        document.getElementById(button_iden).className = 'btn btn-outline-success';
        document.getElementById('info-toast').style.opacity = 1;

        setTimeout(function() {
            document.getElementById(button_iden).className = 'btn btn-outline-secondary';
        }, 2000);

        setTimeout(function() {
            document.getElementById('info-toast').style.opacity = 0;
        }, 2000);

        // update Images
        imageName = document.getElementById('image-name').value;
        imageExtension = document.getElementById('image-extension').value;

        if(document.getElementById('main-image-upload-input').files[0])
            document.getElementById('main-image-upload-text').innerHTML =
                'Nom du fichier uploadé : <b>' + document.getElementById('main-image-upload-input').files[0].name
                + '</b><br /><br />Le fichier \''
                + '<i>https://firebasestorage.googleapis.com/v0/b/mecanicascience.appspot.com/o/blog%2F' + uuid + '_<b>'
                + imageName + '.' + imageExtension
                + '</b>?alt=media</i>\' sera créé.';

        document.getElementById('image_name-input').value = imageName + '.' + imageExtension;

        let date = new Date();
        document.getElementById('cat-title-span').innerHTML = '(dernière sauvegarde à ' + date.getHours() + 'h' + date.getMinutes() + ')';
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









function uploadMainImage(short_title, uuid, image_name) {}


function continueOperationMainImage(success, short_title, uuid) {
    if(!parseInt(success)) {
        document.getElementById('info-toast').style.height = '110.5px';

        document.getElementById('toast-message').innerHTML = 'Upload de l\'image effectuée.';
        document.getElementById('info-toast').style.opacity = 1;

        setTimeout(function() {
           document.getElementById('info-toast').style.opacity = 0;
        }, 2500);
    }
    else {
        document.getElementById('info-toast').style.height = '110.5px';

        document.getElementById('toast-message').innerHTML = 'Erreur lors de l\'upload de l\'image. Veuillez réessayer.';
        document.getElementById('info-toast').style.opacity = 1;

        setTimeout(function() {
           document.getElementById('info-toast').style.height = '110.5px';
       }, 10);

        setTimeout(function() {
           document.getElementById('info-toast').style.opacity = 0;
        }, 2500);
    }
}


function continueOperationMainImageDelete(success, short_title, uuid) {
    if(!parseInt(success)) {
        document.getElementById('info-toast').style.height = '110.5px';

        document.getElementById('toast-message').innerHTML = 'Suppression de l\'image effectuée.';
        document.getElementById('info-toast').style.opacity = 1;

        setTimeout(function() {
           document.getElementById('info-toast').style.opacity = 0;
        }, 2500);
    }
    else {
        document.getElementById('info-toast').style.height = '110.5px';

        document.getElementById('toast-message').innerHTML = 'Erreur lors de la suppression de l\'image. Veuillez réessayer.';
        document.getElementById('info-toast').style.opacity = 1;

        setTimeout(function() {
           document.getElementById('info-toast').style.height = '110.5px';
       }, 10);

        setTimeout(function() {
           document.getElementById('info-toast').style.opacity = 0;
        }, 2500);
    }
}





let autosave = true;
let save_speed = 60 * 5; // in seconds
let saveLoop;

function changeSaveButtonAuto(shouldSave) {
    if(!shouldSave) {
        document.getElementById('auto-save-button').className = 'badge badge-danger';
        document.getElementById('auto-save-button').innerHTML = 'Sauvegarde automatique désactivée';

        clearInterval(saveLoop);
    }
    else {
        document.getElementById('auto-save-button').className = 'badge badge-success';
        document.getElementById('auto-save-button').innerHTML = 'Sauvegarde automatique activée';

        saveLoop = setInterval(function() {
            publishModifs('');
        }, save_speed * 1000);
    }

    autosave = shouldSave;
}





window.addEventListener('keydown', function(event) {
    if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
        switch (String.fromCharCode(event.which).toLowerCase()) {
            case 'k':
                event.preventDefault();
                addCustomBaliseToContent('```', true, true);
                break;
        }
    }

    else if (event.ctrlKey || event.metaKey) {
        switch (String.fromCharCode(event.which).toLowerCase()) {
            case 's':
                event.preventDefault();
                publishModifs('');
                break;

            case 'b':
                event.preventDefault();
                addCustomBaliseToContent('**', true);
                break;

            case 'i':
                event.preventDefault();
                addCustomBaliseToContent('*', true);
                break;

            case 'k':
                event.preventDefault();
                addCustomBaliseToContent('``', true);
                break;
        }
    }
});



function addCustomBaliseToContent(elToAdd, replaceBeforeAndAfterSpaces, addLineEspaceBeforeAndAfter) {
    let el = document.getElementById('content-area');
    if(document.activeElement == el) {
        // replace all next spaces
        let cB = 0;
        let cN = 0;
        let toRemplacer = el.value.substring(el.selectionStart, el.selectionEnd);
        if(replaceBeforeAndAfterSpaces) {
            let foundFirstChar = false;
            for (let i = 0; i < toRemplacer.length; i++) {
                if(!foundFirstChar) {
                    if(el.value[el.selectionStart + i] == ' ') cB++;
                    else                                       foundFirstChar = true;
                }
            }
            toRemplacer = toRemplacer.substring(cB, toRemplacer.length);

            foundFirstChar = false;
            for (let i = el.selectionEnd - 1; i > 0; i--) {
                if(!foundFirstChar) {
                    if(el.value[i] == ' ') cN++;
                    else                   foundFirstChar = true;
                }
            }
            toRemplacer = toRemplacer.substring(0, toRemplacer.length - cN);
        }


        // compute with balises
        let val = el.value.substring(0, el.selectionStart);

        if(addLineEspaceBeforeAndAfter) val += '\n';
        for (let i = 0; i < cB; i++) val += ' ';

        val += elToAdd;
        if(addLineEspaceBeforeAndAfter) val += '\n';

        val += toRemplacer;

        if(addLineEspaceBeforeAndAfter) val += '\n';
        val += elToAdd;

        for (let i = 0; i < cN; i++) val += ' ';

        if(addLineEspaceBeforeAndAfter) val += '\n';

        val += el.value.substring(el.selectionEnd, el.length);


        // return
        el.value = val;
    }
}















// CONVERSION DU CODE EN STOCKABLE
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
