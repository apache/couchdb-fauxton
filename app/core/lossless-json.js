// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.

import { parse as llParse, stringify as llStringify, isSafeNumber, LosslessNumber } from 'lossless-json';

// CouchDB keeps integers at full precision, but the browser's native JSON.parse
// rounds anything larger than Number.MAX_SAFE_INTEGER. Wrap those values in a
// LosslessNumber so they can be read, displayed and written back untouched.
// Numbers that fit in a JS number are returned as plain numbers, so the rest of
// the app keeps working with regular values.
const keepBigInts = (value) => (isSafeNumber(value) ? parseFloat(value) : new LosslessNumber(value));

export const parse = (text) => llParse(text, null, keepBigInts);

export const stringify = (value, replacer, space) => llStringify(value, replacer, space);
