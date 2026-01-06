# Authenticating Using JWT in CouchDB

## Configure Public Key

CouchDB supports JWT Authentication natively by onboarding the Public Key onto the server. Please see
this [documentation](https://docs.couchdb.org/en/stable/api/server/authn.html#jwt-authentication).

Once this public key is set up, any token signed with its corresponding private key will allow you to login through the
FauxtonUI.

## Development

If you would like to enable JWT authentication in your development environent, you can do the following:

1. Start CouchDB docker container. This will create an "empty" instance of CouchDB.

```shell
npm run docker:up
```

2. Run the `docker-configure-jwt.sh` script. This will set up the system databases for CouchDB, as well as generate a
   private/public key pair. The public key will be inserted into CouchDB.

```shell
./docker/docker-configure-jwt.sh
```

3. Use the generated private key to sign your own test tokens using [jwt.io](jwt.io) or a similar service. The CouchDB
   instance will be configured to use tokens with the following headers and payload:

   **Headers**
   ```json
   {
     "alg": "RS256",
     "typ": "JWT",
     "kid": "key1"
   }
   ```

   **Payload**
   ```json
   {
     "sub": "<username>",
     "name": "<name>",
     "iat": <epoch second>,
     "exp": <epoch second>,
     "resource_access": {
       "security.settings": {
         "account": {
           "roles": [
             ...
           ]
         }
       }
     }
   }
   ```

### A note on roles:

Only tokens with the `_admin` role will have full acess to the database. They are analogous to logging in as a server
admin. However, non-admin roles would behave the same as non-admin credentials, where you can still navigate to your own
database by changing the url in the addressbar manually. 