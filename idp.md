# Configuring an Identity provider for Fauxton

!!! note Configure CouchDB first

    To successfully use an Identiy Provider (IdP), one must first configure
    CouchDB to recognize the public key of the IdP. Follow [the documentation](https://docs.couchdb.org/en/stable/api/server/authn.html#jwt-authentication)
    to complete this task.

    Once you are ready for production you might consider [automating key management](https://github.com/beyonddemise/couchdb-idp-updater).

## Preparation

You need:

| Item        | Description                                      | Provided by |
| ----------- | ------------------------------------------------ | ----------- |
| IdP Url     | derived from `/.well-known/openid-configuration` | IdP admin   |
| client id   | a name, suggestion is `fauxton`                  | IdP admin   |
| CallbackURL | Your couchdb server                              | You         |

- The callback URL is either `http(s)://yourserver/_utils` when you run Fauxton from your CouchDB server or `http(s)://yourserver/` when you run Fauxton standalone.
- On [Keycloak](https://www.keycloak.org/) (The IdP we develop with) access is organized in realms, so the openid configuration includes the realm name. E.g. when your realm is `sofa`, your openid url is `http(s)://yourkeycloak/realms/sofa/.well-known/openid-configuration`, There you look for `authorization_endpoint` nad use that minus the `/auth`, like this: `http(s)://yourkeycloak/realms/sofa/protocol/openid-connect`

## CouchDB setup

Follow [the documentation](https://docs.couchdb.org/en/stable/api/server/authn.html#jwt-authentication). FOR role mapping check what the IdP is emitting.

For Keycloak, this works:

```ini
[jwt_auth]
roles_claim_path = realm_access.roles
```

## CORS Setup

Too many moving parts.... later

## Authenticate

On the login page there is a new button `Log In with your Identity provider`, click that and it will open the Idp Login page.

![Login screen](https://github.com/user-attachments/assets/5d15c0ec-93c9-434f-b13f-429eaf813495)

Provide the 3 required values and click login (The values will be retained in localstore). You should get redirected to your IdP's login page. Your IdP could be configured with any authentication method: username/password, 2FA, Social etc.

![IdP Login screen](https://github.com/user-attachments/assets/93d3d11f-decd-4658-9ae8-df588ee2beff)

After succesful login you get redirected to Fauxton and should see the list of databases

## Troubleshooting

- Check the CouchDB [JWT configuration](https://docs.couchdb.org/en/stable/api/server/authn.html#jwt-authentication)
- Do you have the `_admin` role?, Configure that in CouchDB and you IdP
- Is the CORS configuration correct? Might require a restart
- The Chrome developer tools are your friend
