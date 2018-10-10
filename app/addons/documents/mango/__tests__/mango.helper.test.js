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

import helper from '../mango.helper';
import {expect} from 'chai';

describe('Mango Helper', () => {

  describe('getSelectorRegex', () => {
    it('should return no regexes if empty', () => {
      const selector = {};
      const regexes = helper.getSelectorRegexes(selector);
      expect(Object.keys(regexes)).to.have.lengthOf(0);
    });

    it('should return no regexes on multi level if none are present', () => {
      const selector = {
        $and: [
          {name: 'bobby'},
          {$or: [{age: 1}, { age: 2}]}
        ],
        sexe: 'female'
      };
      const regexes = helper.getSelectorRegexes(selector);
      expect(Object.keys(regexes)).to.have.lengthOf(0);
    });

    it('should return regex from array sublevel', () => {
      const selector = {
        $and: [
          {
            $or: [
              {$name: 'bob'},
              {$name: {$regex: '^alex'}}
            ]
          }
        ]
      };
      const regexes = helper.getSelectorRegexes(selector);
      expect(Object.keys(regexes)).to.have.lengthOf(1);
      expect(regexes['$and.0.$or.1.$name']).to.equal('^alex');
    });

    it('should return regex from object sublevel', () => {
      const selector = {
        $and: [{$name: {$regex: '^alex'}}]
      };
      const regexes = helper.getSelectorRegexes(selector);
      expect(Object.keys(regexes)).to.have.lengthOf(1);
      expect(regexes['$and.0.$name']).to.equal('^alex');
    });

    it('should return regex from root', () => {
      const selector  = {
        $name: {
          $regex: '^_design'
        }
      };

      const regexes = helper.getSelectorRegexes(selector);
      expect(Object.keys(regexes)).to.have.lengthOf(1);
      expect(regexes['$name']).to.equal('^_design');
    });
  });
});
