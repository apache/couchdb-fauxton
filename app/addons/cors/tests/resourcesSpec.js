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
  '../../../app',
  '../../../../test/mocha/testUtils',
  '../resources',
], function (app, testUtils, CORS) {
  var assert = testUtils.assert;

  describe('Cors Config Model', function () {
    var cors;

    beforeEach(function () {
      cors = new CORS.Config(null, {node: 'node2@127.0.0.1'});
    });

    it('Splits up origins into array', function () {
      var origins = ['http://hello.com', 'http://another.co.a'];
      cors.set(cors.parse({origins: origins.join(',')}));
      assert.deepEqual(cors.get('origins'), origins);
    });

    it('returns empty array for undefined', function () {
      var origins = { origins : undefined };
      cors.set(cors.parse(origins));
      assert.deepEqual(cors.get('origins'), []);
    });

    it('does not return an empty string (empty origin), when "specific origins" is set, but there are no domains on that list', function () {
        var emptyOrigins = {origins: ''};
        cors.set(cors.parse(emptyOrigins));
        assert.deepEqual(cors.get('origins'), []);
      });

    it('allows valid domains', function () {
      var urls = [
        'http://something.com',
        'https://a.ca',
        'https://something.com:8000',
        'https://www.some-valid-domain.com:80',
        'http://localhost',
        'https://localhost',
        'http://192.168.1.113',
        'http://192.168.1.113:1337'
      ];
      _.each(urls, function (url) {
        assert.isTrue(CORS.validateCORSDomain(url));
      });
    });

    it('fails on non http/https domains', function () {
      var urls = [
        'whoahnellythisaintright',
        'ftp://site.com'
      ];
      _.each(urls, function (url) {
        assert.isFalse(CORS.validateCORSDomain(url));
      });
    });

    it('normalizes common cases, like accidentally added subfolders', function () {
      assert.equal('https://foo.com', CORS.normalizeUrls('https://foo.com/blerg'));
      assert.equal('https://192.168.1.113', CORS.normalizeUrls('https://192.168.1.113/blerg'));
      assert.equal('https://foo.com:1337', CORS.normalizeUrls('https://foo.com:1337/blerg'));
      assert.equal('https://foo.com', CORS.normalizeUrls('https://foo.com'));
    });

  });
});
