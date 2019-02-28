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
import Helpers from "../helpers";

describe('Helpers', () => {

  describe('parseJSON', () => {
    it('replaces "\\n" with actual newlines', () => {
      var string = 'I am a string\\nwith\\nfour\\nlinebreaks\\nin';
      var result = Helpers.parseJSON(string);
      expect(result.match(/\n/g).length).toBe(4);
    });
  });

  describe('truncateDoc', () => {
    var sevenLineDoc = '{\n"line2": 2,\n"line3": 3,\n"line4": 4,\n"line5": 5,\n"line6": 6\n}';

    it('does no truncation if maxRows set higher than doc', () => {
      var result = Helpers.truncateDoc(sevenLineDoc, 10);
      expect(result.isTruncated).toBe(false);
      expect(result.content).toBe(result.content);
    });

    it('truncates by specified line count', () => {
      var result = Helpers.truncateDoc(sevenLineDoc, 5);
      expect(result.isTruncated).toBe(true);
      expect(result.content).toBe('{\n"line2": 2,\n"line3": 3,\n"line4": 4,\n"line5": 5,');

      var result2 = Helpers.truncateDoc(sevenLineDoc, 2);
      expect(result2.isTruncated).toBe(true);
      expect(result2.content).toBe('{\n"line2": 2,');
    });

  });

  describe('selectedItemIsPartitionedView', () => {
    const ddocs = {
      find: () => { return {_id: '_design/ddoc1' }; }
    };
    const selectedView = {
      navItem: 'designDoc',
      designDocSection: 'Views',
      indexName: 'view1'
    };
    const selectedAllDocs = {
      navItem: 'all-docs'
    };

    it('returns false if no item is selected', () => {
      const isPartitionedView = Helpers.selectedItemIsPartitionedView(ddocs, null, true);
      expect(isPartitionedView).toBe(false);
    });

    it('returns false if selected item is not a view', () => {
      const isPartitionedView = Helpers.selectedItemIsPartitionedView(ddocs, selectedAllDocs, true);
      expect(isPartitionedView).toBe(false);
    });

    it('returns false if selected item is a global view', () => {
      const isPartitionedView = Helpers.selectedItemIsPartitionedView(ddocs, selectedView, false);
      expect(isPartitionedView).toBe(false);
    });

    it('returns true if selected item is a partitioned view', () => {
      const isPartitionedView = Helpers.selectedItemIsPartitionedView(ddocs, selectedView, true);
      expect(isPartitionedView).toBe(true);
    });

  });

  describe('isDDocPartitioned', () => {
    const ddocNoOptions = {
      _id: '_design/ddoc1'
    };
    const ddocPartitionedTrue = {
      _id: '_design/ddoc1',
      options: {
        partitioned: true
      }
    };
    const ddocPartitionedFalse = {
      _id: '_design/ddoc1',
      options: {
        partitioned: false
      }
    };

    it('returns false if database is not partitioned', () => {
      let isPartitionedDdoc = Helpers.isDDocPartitioned(ddocNoOptions, false);
      expect(isPartitionedDdoc).toBe(false);

      isPartitionedDdoc = Helpers.isDDocPartitioned(ddocPartitionedFalse, false);
      expect(isPartitionedDdoc).toBe(false);

      isPartitionedDdoc = Helpers.isDDocPartitioned(ddocPartitionedTrue, false);
      expect(isPartitionedDdoc).toBe(false);
    });

    it('returns true if database is partitioned and ddoc partitioned option is not set to false', () => {
      let isPartitionedDdoc = Helpers.isDDocPartitioned(ddocNoOptions, true);
      expect(isPartitionedDdoc).toBe(true);

      isPartitionedDdoc = Helpers.isDDocPartitioned(ddocPartitionedTrue, true);
      expect(isPartitionedDdoc).toBe(true);
    });

    it('returns false if database is partitioned but ddoc is set as non-partitioned', () => {
      const isPartitionedDdoc = Helpers.isDDocPartitioned(ddocPartitionedFalse, true);
      expect(isPartitionedDdoc).toBe(false);
    });

  });

});
