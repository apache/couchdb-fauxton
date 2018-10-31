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


/**
 * Represents the selected item in the sidebar, including nested nav items to ensure the appropriate item
 * is visible and highlighted.
 */
export class SidebarItemSelection {

  /**
   * Creates a new sidebar selection.
   *
   * @param {string} navItem 'permissions', 'changes', 'all-docs', 'compact', 'mango-query', 'designDoc'
   *   (or anything thats beenextended)
   * @param {string} [params] (optional) If you passed 'designDoc' as the first param. This lets you
   *   specify which sub-item should be selected, e.g.:
   *      Actions.selectNavItem('designDoc', { designDocName: 'my-design-doc', section: 'metadata' });
   *      Actions.selectNavItem('designDoc', { designDocName: 'my-design-doc', section: 'Views', indexName: 'my-view' });
   */
  constructor(navItem, params) {
    this.navItem = navItem;
    if (params) {
      const {designDocName, designDocSection, indexName} = params;
      this.designDocName = designDocName ? designDocName : '';
      this.designDocSection = designDocSection ? designDocSection : '';
      this.indexName = indexName ? indexName : '';
    }
  }
}

