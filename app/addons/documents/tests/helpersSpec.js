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
define([
  '../../../core/api',
  '../helpers',
  '../../../../test/mocha/testUtils',
], function (FauxtonAPI, Helpers, testUtils) {
  var assert = testUtils.assert;

  describe('Helpers', function () {

    describe('parseJSON', function () {
      it('replaces "\\n" with actual newlines', function () {
        var string = 'I am a string\\nwith\\nfour\\nlinebreaks\\nin';
        var result = Helpers.parseJSON(string);
        assert.equal(result.match(/\n/g).length, 4);
      });
    });

    describe('truncateDoc', function () {
      var sevenLineDoc = '{\n"line2": 2,\n"line3": 3,\n"line4": 4,\n"line5": 5,\n"line6": 6\n}';

      it('does no truncation if maxRows set higher than doc', function () {
        var result = Helpers.truncateDoc(sevenLineDoc, 10);
        assert.equal(result.isTruncated, false);
        assert.equal(result.content, result.content);
      });

      it('truncates by specified line count', function () {
        var result = Helpers.truncateDoc(sevenLineDoc, 5);
        assert.equal(result.isTruncated, true);
        assert.equal(result.content, '{\n"line2": 2,\n"line3": 3,\n"line4": 4,\n"line5": 5,');

        var result2 = Helpers.truncateDoc(sevenLineDoc, 2);
        assert.equal(result2.isTruncated, true);
        assert.equal(result2.content, '{\n"line2": 2,');
      });

    });

  });

});
