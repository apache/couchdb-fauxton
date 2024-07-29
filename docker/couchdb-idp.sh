#!/bin/bash
#launches the CouchDB and keycloak containers
# then configure both to interact with each other

# Part1: Setup
KC_URL="http://localhost:8090"
COUCHDB_URL="http://localhost:5984"

# Part2: reusable functions
function kc_tokens() {
    local url=${KC_URL}/realms/master/protocol/openid-connect/token

    # Post the form data and store the response
    local response=$(curl $url \
        --header 'Content-Type: application/x-www-form-urlencoded' \
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
}

function kc_refresh() {
    local url=${KC_URL}/realms/master/protocol/openid-connect/token

    curl $url \
        --header 'Content-Type: application/x-www-form-urlencoded' \
        --data-urlencode 'client_id=admin-cli' \
        --data-urlencode 'grant_type=refresh_token' \
        --data-urlencode 'refresh_token={{KEYCLOAK_REFRESH_TOKEN}}'

    # Post the form data and store the response
    local response=$(curl $url \
        --header 'Content-Type: application/x-www-form-urlencoded' \
        --data-urlencode 'client_id=admin-cli' \
        --data-urlencode 'refresh_token={{$KC_REFRESH_TOKEN}}' \
        --data-urlencode 'grant_type=refresh_token')

    # Extract the access_token and refresh_token from the response
    local access_token=$(echo "$response" | jq -r '.access_token')
    local refresh_token=$(echo "$response" | jq -r '.refresh_token')

    # Set the environment variables
    export KC_ACCESS_TOKEN="$access_token"
    export KC_REFRESH_TOKEN="$refresh_token"
}

function kc_get() {
    local url=${KC_URL}$1

    # Post the form data and store the response
    local response=$(curl $url \
        --header 'Content-Type: application/json' \
        --header "Authorization: Bearer $KC_ACCESS_TOKEN")
    echo $response
}

function kc_post() {
    local url=${KC_URL}$1
    local data=$2
    echo posting to $url
    # Post the form data and store the response
    local response=$(curl -S -X POST $url \
        --header 'Content-Type: application/json' \
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
    adminrole=$(kc_get "/admin/realms/sofa/roles?first=0&max=101&q=_admin" | jq -r .[0].id)
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

# Part3: Launch containers
docker compose -f docker/couchdb-idp.yml up -d

# Part4: Configure Keycloak
kc_config

# Part5: Configure CouchDB
