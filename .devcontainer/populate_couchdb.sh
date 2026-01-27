#!/bin/bash
# Use to create CouchDB system databases and one demo database

# Wait until CouchDB answers
until curl -fsS "http://localhost:5984/_up" >/dev/null 2>&1; do sleep 2; done

# Variables needed
now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Check required CouchDB environment variables
if [ -z "${COUCHDB_USER}" ] || [ -z "${COUCHDB_PASSWORD}" ]; then
  echo "Error: COUCHDB_USER and COUCHDB_PASSWORD environment variables must be set"
  exit 1
fi
# Populate CouchDB
COUCHDB_USRPWD=${COUCHDB_USER}:${COUCHDB_PASSWORD}
COUCHDB_PORT=5984
SRV=http://localhost:${COUCHDB_PORT}

echo Couch $SRV

#SYSTEM databases
curl -u "${COUCHDB_USRPWD}" -X PUT ${SRV}/_users
curl -u "${COUCHDB_USRPWD}" -X PUT ${SRV}/_replicator
curl -u "${COUCHDB_USRPWD}" -X PUT ${SRV}/_global_changes

#DEMO database
curl -u "${COUCHDB_USRPWD}" -X PUT ${SRV}/demo

# Status
curl -u "${COUCHDB_USRPWD}" ${SRV} | jq

# Session
curl -u "${COUCHDB_USRPWD}" ${SRV}/_session | jq

echo DONE