#!/bin/bash
# Runs after dev container startup
# Wait until CouchDB answers
until curl -fsS "http://localhost:5984/_up" >/dev/null 2>&1; do sleep 2; done

now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

COUCHDB_USRPWD=${COUCHDB_USER}:${COUCHDB_PASSWORD}
COUCHDB_PORT=5984
SRV=http://localhost:${COUCHDB_PORT}

curl -u "${COUCHDB_USRPWD}" -X POST ${SRV}/demo -H "Content-Type: application/json" -d "{\"date\" : \"$now\", \"action\" : \"postStart\"}" | jq


npm run dev