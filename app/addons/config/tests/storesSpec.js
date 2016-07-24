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
import Stores from '../stores';
import utils from '../../../../test/mocha/testUtils';

var assert = utils.assert;

describe("ConfigStore", function () {
  var configStore = Stores.configStore;

  describe("mapSection", function () {
    beforeEach(function () {
      configStore._editOptionName = 'b';
      configStore._editSectionName = 'test';
    });

    afterEach(function () {
      configStore.reset();
    });

    it("sorts options ascending", function () {
      var options = configStore.mapSection({ b: 1, c: 2, a: 3 }, 'test');
      assert.equal(options[0].optionName, 'a');
    });

    it("sets the first option as the header", function () {
      var options = configStore.mapSection({ b: 1, c: 2, a: 3 }, 'test');
      assert.isTrue(options[0].header);
    });

    it("sets the option that is being edited", function () {
      var options = configStore.mapSection({ b: 1, c: 2, a: 3 }, 'test');
      assert.isTrue(options[1].editing);
    });
  });

  describe("saveOption", function () {
    var sectionName, optionName, value;

    beforeEach(function () {
      sectionName = 'a';
      optionName = 'b';
      value = 1;
    });

    afterEach(function () {
      configStore.reset();
    });

    it("saves option to sections", function () {
      configStore._sections = {};

      configStore.saveOption(sectionName, optionName, value);
      assert.deepEqual(configStore._sections, { a: { b: 1 } });
    });
  });

  describe("deleteOption", function () {
    var sectionName, optionName;

    beforeEach(function () {
      sectionName = 'a';
      optionName = 'b';
    });

    afterEach(function () {
      configStore.reset();
    });

    it("deletes option from section", function () {
      configStore._sections = { a: { b: 1, c: 2 } };

      configStore.deleteOption(sectionName, optionName);
      assert.deepEqual(configStore._sections, { a: { c: 2 } });
    });

    it("deletes section when all options are deleted", function () {
      configStore._sections = { a: { b: 1 } };

      configStore.deleteOption(sectionName, optionName);
      assert.deepEqual(configStore._sections, {});
    });
  });
});
