# Liste des variables de configuration
## Ajouter une variable de configuration
Sur Heroku, effectuer la commande "heroku config:set KEY_1=VALUE_1 KEY_2=VALUE_2 ..."
En NodeJS, les variables sont accessibles via `process.env` :
```
console.log(process.env.KEY_1)
```
Pour voir toutes les variables de configuration, executer la commande `heroku config`.


## Liste :
 - FIREBASE_MAIN_IMAGE_LINK = xxxx
 - FIREBASE_BUCKET_NAME = xxxx
 - FIREBASE_BLOG_LINK = xxxx

 - MAIN_PASS = xxxx
 - PASSWORD = xxxx

 - CREDENTIAL_PROJECT_ID = xxxx
 - CREDENTIAL_PRIVATE_KEY_ID = xxxxx
 - CREDENTIAL_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\n[...]\n-----END PRIVATE KEY-----\n"
 - CREDENTIAL_CLIENT_EMAIL = xxxx
 - CREDENTIAL_CLIENT_ID = xxxx
 - CLIENT_CERT_URL = xxxx
