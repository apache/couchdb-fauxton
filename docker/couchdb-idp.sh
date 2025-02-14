#!/bin/bash
#launches the CouchDB and keycloak containers
# then configure both to interact with each other

# Part1: Setup
KC_URL="http://localhost:8090"
COUCHDB_URL="http://localhost:5984"
COUCHDB_USER=tester
COUCHDB_PASSWORD=testerpass

# Part2: reusable functions
function kc_tokens() {
    echo "Loading tokens"
    local url=${KC_URL}/realms/master/protocol/openid-connect/token

    # Post the form data and store the response
    local response=$(curl $url \
        --header 'Content-Type: application/x-www-form-urlencoded' \
        --no-progress-meter \
        --data-urlencode 'client_id=admin-cli' \
        --data-urlencode 'username=admin' \
        --data-urlencode 'password=password' \
        --data-urlencode 'grant_type=password')

    # Extract the access_token and refresh_token from the response
    local access_token=$(echo "$response" | jq -r '.access_token')
    local refresh_token=$(echo "$response" | jq -r '.refresh_token')

    # Set the environment variables
    export KC_ACCESS_TOKEN="$access_token"
    export KC_REFRESH_TOKEN="$refresh_token"
    echo "Tokens loaded"
}

function kc_refresh() {
    local url=${KC_URL}/realms/master/protocol/openid-connect/token
    echo "Refreshing tokens from $url"

    # Post the form data and store the response
    local response=$(curl $url \
        --header 'Content-Type: application/x-www-form-urlencoded' \
        --no-progress-meter \
        --data-urlencode 'client_id=admin-cli' \
        --data-urlencode 'refresh_token={{$KC_REFRESH_TOKEN}}' \
        --data-urlencode 'grant_type=refresh_token')

    # Extract the access_token and refresh_token from the response
    local access_token=$(echo "$response" | jq -r '.access_token')
    local refresh_token=$(echo "$response" | jq -r '.refresh_token')

    # Set the environment variables
    export KC_ACCESS_TOKEN="$access_token"
    export KC_REFRESH_TOKEN="$refresh_token"

    echo "Tokens refreshed"
}

function kc_get() {
    local url=${KC_URL}$1

    # Get an URL and store the response
    echo GET from $url >&2
    local response=$(curl $url \
        --no-progress-meter \
        --header 'Content-Type: application/json' \
        --header "Authorization: Bearer $KC_ACCESS_TOKEN")
    echo $response
}

function kc_post() {
    local url=${KC_URL}$1
    local data=$2
    echo POST to $url >&2
    # Post the form data and store the response
    local response=$(curl -S -X POST $url \
        --header 'Content-Type: application/json' \
        --no-progress-meter \
        --header "Authorization: Bearer $KC_ACCESS_TOKEN" \
        --data @docker/$data)
    echo $response
}

function kc_config() {
    # Get Tokens
    kc_tokens

    # Create realm sofa
    kc_post "/admin/realms" sofa_realm.json

    # Create _admin Role
    kc_post "/admin/realms/sofa/roles" admin_role.json
    adminroleRaw=$(kc_get "/admin/realms/sofa/roles?first=0&max=101&q=_admin")
    adminrole=$(echo $adminroleRaw | jq -r .[0].id)
    echo adminrole $adminrole
    echo '[{"id": "'${adminrole}'",' >docker/johndoe_role.json
    echo '"name": "_admin", "description": "CouchDB Administrator",' >>docker/johndoe_role.json
    echo '"composite": false,"clientRole": false,"containerId": "sofa"}]' >>docker/johndoe_role.json

    # Create user johndoe and assign _admin role
    kc_post "/admin/realms/sofa/users" johndoe_user.json
    johndoe=$(kc_get "/admin/realms/sofa/ui-ext/brute-force-user?briefRepresentation=true&first=0&max=1" | jq -r .[0].id)
    echo "johndoe $johndoe"
    kc_post "/admin/realms/sofa/users/${johndoe}/role-mappings/realm" johndoe_role.json

    # Create client fauxton
    kc_post "/admin/realms/sofa/clients" fauxton_client.json
}

function couch_get() {
    local url=${COUCHDB_URL}$1

    # Get an URL and store the response
    echo GET from $url
    local response=$(curl $url \
        --user $COUCHDB_USER:$COUCHDB_PASSWORD \
        --no-progress-meter \
        --header 'Content-Type: application/json')
    echo $response
}

function couch_post() {
    local url=${COUCHDB_URL}$1
    local data=$2
    echo POST to $url
    # Post the form data and store the response
    local response=$(curl -S -X POST $url \
        --user $COUCHDB_USER:$COUCHDB_PASSWORD \
        --header 'Content-Type: application/json' \
        --no-progress-meter \
        --data @docker/$data)
    echo $response
}

function couch_put() {
    local url=${COUCHDB_URL}$1
    echo PUT to $url
    # Post the form data and store the response
    local response=$(curl -S -X PUT $url \
        --no-progress-meter \
        --header 'Content-Type: text/plain' \
        --user $COUCHDB_USER:$COUCHDB_PASSWORD)
    echo $response
}

# Part3: Launch containers
# docker compose -f docker/couchdb-idp.yml pull
docker compose -f docker/couchdb-idp.yml up -d

# Pre part 4: Wait for Keycloak to start
curl -k \
    --retry 10 \
    --retry-delay 10 \
    --retry-all-errors \
    --no-progress-meter \
    --fail \
    ${KC_URL}/admin/master/console/ >/dev/null

if [ "$?" -ne 0 ]; then
    echo "Failed to start Keycloak"
    exit 1
fi

# Part4: Configure Keycloak

kc_config

# Pre part 5: Wait for Couchdb to start
curl -k \
    --retry 10 \
    --retry-delay 10 \
    --retry-all-errors \
    --no-progress-meter \
    --fail \
    ${COUCHDB_URL}

# Part5: Configure CouchDB
couch_put /_users
couch_put /_replicator
couch_put /_global_changes

# activate jwt authentication
curl --request PUT ${COUCHDB_URL}/_node/_local/_config/chttpd/authentication_handlers \
    --header 'Content-Type: text/plain' \
    --no-progress-meter \
    --user $COUCHDB_USER:$COUCHDB_PASSWORD \
    --data '"{chttpd_auth, cookie_authentication_handler}, {chttpd_auth, jwt_authentication_handler}, {chttpd_auth, default_authentication_handler}"'

# Retrieve the public key from Keycloak
jwks_uri=$(curl --no-progress-meter "${KC_URL}/realms/sofa/.well-known/openid-configuration" | jq -r .jwks_uri)
raw_key=$(curl $jwks_uri --no-progress-meter | jq -r '.keys[0]')
kid=$(echo $raw_key | jq -r .kid)
flat_key=$(echo "$raw_key" | tr -d '\n')
node docker/extractpem.js "$flat_key" >tmp.key

#Post it to CouchDB
curl --request PUT ${COUCHDB_URL}/_node/nonode@nohost/_config/jwt_keys/rsa:${kid} \
    --header 'Content-Type: text/plain' \
    --no-progress-meter \
    --user $COUCHDB_USER:$COUCHDB_PASSWORD \
    --data @tmp.key

rm tmp.key

# Path to roles
curl --request PUT ${COUCHDB_URL}/_node/nonode@nohost/_config/jwt_auth/roles_claim_path \
    --header 'Content-Type: text/plain' \
    --no-progress-meter \
    --user $COUCHDB_USER:$COUCHDB_PASSWORD \
    --data '"realm_access.roles"'

# Restart CouchDB
curl --request POST ${COUCHDB_URL}/_node/_local/_restart \
    --no-progress-meter \
    --user $COUCHDB_USER:$COUCHDB_PASSWORD
