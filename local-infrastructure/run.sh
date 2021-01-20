#!/bin/bash
#%
#% Common Forms Toolkit Local Infrastructure quick run
#%
#%  [ENV_FILE=./.env] [VERBOSE=false] THIS_FILE.sh
#%
#%    [TIMEOUT=10] THIS_FILE.sh ./input.csv [./results.csv]
#%
#%  Please create ../app/config/local.json.
#%    Minimal, redacted example: ../app/config/sample-local.json
#%
#%  Request a GETOK Account and password.
#%    https://getok.nrs.gov.bc.ca/app/about
#%
# Prerequisites: Node.js 12, docker, docker compose and python
# https://bcgov.github.io/common-forms-toolkit/local-infrastructure/

# Boilerplate - halt conditions (errors, unsets, non-zero pipes), verbosity and help (w/o params)
#
set -euo pipefail
[ ! "${VERBOSE:-}" == "true" ] || set -x
[ -f "../app/config/local.json" ] && ((!$#)) || {
    grep "^#%" ${0} | sed -e "s/^#%//g" -e "s|THIS_FILE.sh|${0}|g"
    exit
}

# Stop, build and bring up containers as services (daemons)
#
docker-compose stop
docker-compose build
docker-compose up -d

# Follow migrations
#
docker logs -f comfort_node_migrate

# Run migrations (script includes check/wait for keycloak service)
#
docker exec comfort_keycloak bash /tmp/keycloak-local-user.sh

# Build application
#
pushd ../app/
npm run all:install
npm run all:build

# Browse to KeyCloack.Install open-cli and browse to site when app is available
#
(
    while (! curl -s http://localhost:8080 -o /dev/null); do
        sleep 10
    done
    npx open-cli http://localhost:28080/
    npx open-cli http://localhost:8080/
) &

# Start app
#
npm run serve
