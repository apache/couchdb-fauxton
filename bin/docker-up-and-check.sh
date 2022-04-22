#!/bin/bash

# Licensed under the Apache License, Version 2.0 (the "License"); you may not
# use this file except in compliance with the License. You may obtain a copy of
# the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations under
# the License.


## Sometimes the couchdb docker container won't start correctly, which causes
## the GitHub Actions build to fail and forces users to resubmit their PRs.
## This script tries to minimize the issue by retrying to start the containers
## in case of failure.


start_containters_and_check() {
  npm run docker:up
  if [[ $? != 0 ]]; then exit $?; fi

  # Uses docker logs to check if couchdb server has started
  NUM_CHECKS=10
  for ((check=1; check<=$NUM_CHECKS; check++));
  do
    echo "Checking if couchdb container has started ($check of $NUM_CHECKS)"
    logs=$(docker logs couchdb)
    if [[ $logs == *"Errno socket error"* ]]; then
      echo "Failed to start couchdb container"
      echo "=============================="
      docker logs couchdb
      echo "=============================="
      return 1
    fi
    if [[ $logs == *"Apache CouchDB has started on"* ]]; then
      echo "Docker containers are up"
      echo "========================"
      docker logs couchdb
      echo "========================"
      return 0
    fi
    sleep 6
  done
}

stop_containters() {
  npm run docker:down
  sleep 2
}


if start_containters_and_check 
then
  exit 0
fi

stop_containters
exit 2
