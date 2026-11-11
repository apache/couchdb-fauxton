#!/bin/bash
# Configures CouchDB JWT Authentication Public Key

# Part1: Setup
COUCHDB_URL="http://localhost:5984"
COUCHDB_USER=tester
COUCHDB_PASSWORD=testerpass

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
    echo POST to $url
    # Post the form data and store the response
    if [ $# -eq 1 ]; then
      local response=$(curl -sSo - -w "HTTP Status: %{http_code}\n\n" -X POST $url \
          --no-progress-meter \
          --header 'Content-Type: application/json' \
          --user $COUCHDB_USER:$COUCHDB_PASSWORD)
    elif [ $# -eq 2 ]; then
      echo "with body $2"
      local response=$(curl -sSo - -w "HTTP Status: %{http_code}\n\n" -X POST $url \
          --header 'Content-Type: application/json' \
          --user $COUCHDB_USER:$COUCHDB_PASSWORD \
          --data "$2")
    else
      echo "You provided $# arguments, need one or two"
    fi;
    echo -e "$response\n"
}

function couch_put() {
    local url=${COUCHDB_URL}$1
    echo PUT to $url
    # Post the form data and store the response
    if [ $# -eq 1 ]; then
      local response=$(curl -sSo - -w "HTTP Status: %{http_code}\n\n" -X PUT $url \
          --no-progress-meter \
          --header 'Content-Type: application/json' \
          --user $COUCHDB_USER:$COUCHDB_PASSWORD)
    elif [ $# -eq 2 ]; then
      echo "with body $2"
      local response=$(curl -sSo - -w "HTTP Status: %{http_code}\n\n" -X PUT $url \
          --header 'Content-Type: application/json' \
          --user $COUCHDB_USER:$COUCHDB_PASSWORD \
          --data "$2")
    else
      echo "You provided $# arguments, need one or two"
    fi;
    echo -e "$response\n"
}

# Part 1: Wait for container
curl -k \
    --retry 10 \
    --retry-delay 10 \
    --retry-all-errors \
    --no-progress-meter \
    --fail \
    ${COUCHDB_URL}

# Part 2: Configure CouchDB
couch_put /_users
couch_put /_replicator
couch_put /_global_changes

# Activate jwt authentication
couch_put "/_node/_local/_config/chttpd/authentication_handlers" '"{chttpd_auth, cookie_authentication_handler}, {chttpd_auth, jwt_authentication_handler}, {chttpd_auth, default_authentication_handler}"'

# create public/private key pair
echo "You can use the generated test_private_key.pem key to sign your jwt tokens"
openssl genrsa -out test_private_key.pem 2048
openssl rsa -in test_private_key.pem -pubout -out test_public_key.pem

# first part flattens public key, second part wraps it in double quotes
awk '{printf "%s\\\\n", $0}' test_public_key.pem | awk '{print "\"" $0 "\""}' >  formatted.key

# Insert public key into CouchDB
kid="key1"
couch_put "/_node/nonode@nohost/_config/jwt_keys/rsa:${kid}" "@formatted.key"

#rm tmp.key

# Path to roles
couch_put "/_node/nonode@nohost/_config/jwt_auth/roles_claim_path" '"resource_access.security\\.settings.account.roles"'

# Restart CouchDB
couch_post "/_node/_local/_restart"