#!/usr/bin/env bash

# Requires jq, curl and postman-pact
# Usage: env PACT_BROKER_DOMAIN="http://my.pactbroker.com" ./labs/batch-converter/main.sh

cd "${BASH_SOURCE%/*}" || exit 

function convert() {
    LIST_PACT=`curl -s $1 | jq -r "._links.pacts[].href"`
    (IFS='
    '
    for url in $LIST_PACT; do
        echo "- $url"
        FILE_NAME=`postman-pact $url | jq -r ".info.name"`
        postman-pact $url > "$2$FILE_NAME.json"
        echo "  Success converting $FILE_NAME"
    done)
}

convert "$PACT_BROKER_URL/pacts/latest" "output/"
