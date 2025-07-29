#!/bin/bash
# Runs after dev container startup

# Variables needed
now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
REALM=empire

# Check required CouchDB environment variables
if [ -z "${COUCHDB_USER}" ] || [ -z "${COUCHDB_PASSWORD}" ]; then
  echo "Error: COUCHDB_USER and COUCHDB_PASSWORD environment variables must be set"
  exit 1
fi
# Populate CouchDB
COUCHDB_USRPWD=${COUCHDB_USER}:${COUCHDB_PASSWORD}
COUCHDB_PORT=5984

#Inside the container
if [ "${INSIDE_CONTAINER}" = "true" ]; then
  export SRV=http://couchdb:${COUCHDB_PORT}
  export KEYCLOAK=http://keycloak:8090
else
  export SRV=http://localhost:${COUCHDB_PORT}
  export KEYCLOAK=http://localhost:8090
fi

#SYSTEM databases
curl -u ${COUCHDB_USRPWD} -X PUT ${SRV}/_users
curl -u ${COUCHDB_USRPWD} -X PUT ${SRV}/_replicator
curl -u ${COUCHDB_USRPWD} -X PUT ${SRV}/_global_changes

#DEMO database
curl -u ${COUCHDB_USRPWD} -X PUT ${SRV}/demo
curl -u ${COUCHDB_USRPWD} -X PUT ${SRV}/demo/firstdoc -d '{"name" : "Peter Pan", "location" : "Neverland"}' | jq
curl -u ${COUCHDB_USRPWD} -X POST ${SRV}/demo -H "Content-Type: application/json" -d "{\"date\" : \"$now\", \"action\" : \"postCreate\"}" | jq

# Status
curl -u ${COUCHDB_USRPWD} ${SRV} | jq

# Session
curl -u ${COUCHDB_USRPWD} ${SRV}/_session | jq

#DEMO back
curl -u ${COUCHDB_USRPWD} ${SRV}/demo/firstdoc | jq


# Check required Keycloak environment variables
if [ -z "${KEYCLOAK_ADMIN}" ] || [ -z "${KEYCLOAK_ADMIN_PASSWORD}" ]; then
  echo "Error: KEYCLOAK_ADMIN and KEYCLOAK_ADMIN_PASSWORD environment variables must be set"
  exit 1
fi

# Populate Keycloak
curl ${KEYCLOAK}

echo Admin login
KEYCLOAK_ACCESS_TOKEN=$(curl -X POST ${KEYCLOAK}/realms/master/protocol/openid-connect/token \
  --header 'content-type: application/x-www-form-urlencoded' \
  --data client_id=admin-cli \
  --data "username=${KEYCLOAK_ADMIN}" \
  --data "password=${KEYCLOAK_ADMIN_PASSWORD}" \
  --data grant_type=password \
  --silent | jq -r '.access_token')

echo Create realm
curl -X POST ${KEYCLOAK}/admin/realms \
  --header "authorization: Bearer ${KEYCLOAK_ACCESS_TOKEN}" \
  --header "content-type: application/json" \
  --data '{
    "id": "'"${REALM}"'",
    "realm": "'"${REALM}"'",
    "displayName": "The mighty realm of '"${REALM}"'",
    "enabled": true,
    "sslRequired": "NONE",
    "registrationAllowed": true,
    "loginWithEmailAllowed": true,
    "duplicateEmailsAllowed": false,
    "resetPasswordAllowed": true,
    "editUsernameAllowed": true,
    "bruteForceProtected": true
}'

echo Create client fauxton
curl -X POST ${KEYCLOAK}/admin/realms/${REALM}/clients \
  --header "authorization: Bearer ${KEYCLOAK_ACCESS_TOKEN}" \
  --header 'content-type: application/json' \
  --data '{
    "clientId": "fauxton",
    "name" : "CouchDB Fauxton",
    "enabled": true,
    "publicClient": true,
    "directAccessGrantsEnabled": true,
    "redirectUris":["http://localhost:8000","http://localhost:8000/"],
    "webOrigins": ["localhost:8000"],
    "protocolMappers": [
        {
                "name": "email to sub",
                "protocol": "openid-connect",
                "protocolMapper": "oidc-usermodel-property-mapper",
                "consentRequired": false,
                "config": {
                    "introspection.token.claim": "true",
                    "userinfo.token.claim": "true",
                    "user.attribute": "email",
                    "id.token.claim": "true",
                    "lightweight.claim": "false",
                    "access.token.claim": "true",
                    "claim.name": "sub",
                    "jsonType.label": "String"
                }
            }
    ]
}'

echo Create role _admin
curl -X POST ${KEYCLOAK}/admin/realms/${REALM}/roles \
  --header "authorization: Bearer ${KEYCLOAK_ACCESS_TOKEN}" \
  --header 'content-type: application/json' \
  --data '{
       "name":"_admin",
       "description":"Full access"
}'

echo retrive id for _admin
ROLE_ADMIN=$(curl "${KEYCLOAK}/admin/realms/${REALM}/roles?first=0&max=101&search=_admin" \
  --header "authorization: Bearer ${KEYCLOAK_ACCESS_TOKEN}" \
  --header 'caontent-type: application/json' | jq -r '.[0].id')

echo create role role1
curl -X POST ${KEYCLOAK}/admin/realms/${REALM}/roles \
  --header "authorization: Bearer ${KEYCLOAK_ACCESS_TOKEN}" \
  --header 'content-type: application/json' \
  --data '{
       "name":"role1",
       "description":"Member of role1"
}'

echo retrieve id for role1
ROLE_ROLE1=$(curl "${KEYCLOAK}/admin/realms/${REALM}/roles?first=0&max=101&search=role1" \
  --header "authorization: Bearer ${KEYCLOAK_ACCESS_TOKEN}" \
  --header 'content-type: application/json' | jq -r '.[0].id')

echo Create user Hari Seldon
curl -X POST ${KEYCLOAK}/admin/realms/${REALM}/users \
  --header "authorization: Bearer ${KEYCLOAK_ACCESS_TOKEN}" \
  --header 'content-type: application/json' \
  --data '{
    "requiredActions": [],
    "username": "hariseldon",
    "enabled": true,
    "firstName": "Hari",
    "lastName": "Seldon",
    "email": "hari.seldon@terminus.empire",
    "emailVerified": true,
    "credentials": [
        {
            "type": "password",
            "value": "password",
            "temporary": false
        }
    ]
}'

echo retrieve ID for user harisedon
USER_SELDON=$(curl "${KEYCLOAK}/admin/realms/${REALM}/ui-ext/brute-force-user?first=0&max=101&q=&search=hariseldon" \
  --header "authorization: Bearer ${KEYCLOAK_ACCESS_TOKEN}" \
  --header 'content-type: application/json' | jq -r '.[0].id')

echo Create user Gaal Dornick
curl -X POST ${KEYCLOAK}/admin/realms/${REALM}/users \
  --header "authorization: Bearer ${KEYCLOAK_ACCESS_TOKEN}" \
  --header 'content-type: application/json' \
  --data '{
    "requiredActions": [],
    "username": "gaaldornick",
    "enabled": true,
    "firstName": "Gaal",
    "lastName": "Dornick",
    "email": "gaal.dornick@terminus.empire",
    "emailVerified": true,
    "credentials": [
        {
            "type": "password",
            "value": "password",
            "temporary": false
        }
    ]
}'

echo retrive ID for user gaaldornick
USER_DORNICK=$(curl "${KEYCLOAK}/admin/realms/${REALM}/ui-ext/brute-force-user?first=0&max=101&q=&search=gaaldornick" \
  --header "authorization: Bearer ${KEYCLOAK_ACCESS_TOKEN}" \
  --header 'content-type: application/json' | jq -r '.[0].id')

echo Assign role _admin to seldon
curl -X POST ${KEYCLOAK}/admin/realms/${REALM}/users/${USER_SELDON}/role-mappings/realm/${ROLE_ADMIN}  \
  --header "authorization: Bearer ${KEYCLOAK_ACCESS_TOKEN}"

echo Assign role role1 to seldon
curl -X POST ${KEYCLOAK}/admin/realms/${REALM}/users/${USER_SELDON}/role-mappings/realm/${ROLE_ROLE1}  \
  --header "authorization: Bearer ${KEYCLOAK_ACCESS_TOKEN}"

echo Assign role role1 to gaaldornick
curl -X POST ${KEYCLOAK}/admin/realms/${REALM}/users/${USER_DORNICK}/role-mappings/realm/${ROLE_ROLE1}  \
  --header "authorization: Bearer ${KEYCLOAK_ACCESS_TOKEN}"

echo enable CouchDB JWT login
curl -u ${COUCHDB_USRPWD} -X PUT "${SRV}/_node/_local/_config/chttpd/authentication_handlers" \
-H "Content-Type: text/plain" \
-d '"{chttpd_auth, cookie_authentication_handler}, {chttpd_auth, jwt_authentication_handler}, {chttpd_auth, default_authentication_handler}"'

echo point to idp_host
curl -u ${COUCHDB_USRPWD} -X PUT "${SRV}/_node/_local/_config/jwt_auth/idp_host" \
  --header 'content-type: text/plain' \
  --data "\"${KEYCLOAK}/realms/${REALM}\""

echo set require exp,iat
curl -u ${COUCHDB_USRPWD} -X PUT "${SRV}/_node/_local/_config/jwt_auth/required_claims" \
  --header 'content-type: text/plain' \
  --data "\"exp,iat,email\""

echo ADD PUblic key
node .devcontainer/jwks2couch.mjs

echo Set path for role resolution
curl -u ${COUCHDB_USRPWD} -X PUT "${SRV}/_node/nonode@nohost/_config/jwt_auth/roles_claim_path" \
-H "Content-Type: text/plain" \
-d "\"realm_access.roles\""

echo Restart CouchDB
curl -u ${COUCHDB_USRPWD} -X POST "${SRV}/_node/_local/_restart"

echo DONE