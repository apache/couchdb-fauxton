#!/bin/bash

set -e

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

# Path is hardcoded because this script is intended for use by CI (GH Actions)
# so there's really no need to auto find the chrome binary 
CHROME_PATH=/usr/bin/google-chrome
CHROME_VERSION=$("$CHROME_PATH" --version  | sed -E 's/Google Chrome //' | sed -E 's/Chromium //' | awk -F. '{print $1}')

if [[ $CHROME_VERSION == "" ]]; then echo "Failed to find chrome version from '$CHROME_PATH'" && exit 1; fi

echo "Installing chromedriver@$CHROME_VERSION"

npm install chromedriver@$CHROME_VERSION
