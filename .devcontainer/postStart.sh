#!/bin/bash
# Runs after dev container startup
now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
# Give containers some space
sleep 5

COUCHDB_USRPWD=${COUCHDB_USER}:${COUCHDB_PASSWORD}
COUCHDB_PORT=5984

export SRV=http://localhost:${COUCHDB_PORT}

curl -u "${COUCHDB_USRPWD}" -X POST ${SRV}/demo -H "Content-Type: application/json" -d "{\"date\" : \"$now\", \"action\" : \"postStart\"}" | jq

npm run dev