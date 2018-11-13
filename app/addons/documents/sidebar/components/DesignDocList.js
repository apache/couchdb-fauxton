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

import PropTypes from 'prop-types';
import React from 'react';
import FauxtonAPI from '../../../../core/api';
import DocHelpers from '../../helpers';
import DesignDoc from './DesignDoc';

export default class DesignDocList extends React.Component {
  static propTypes = {
    database: PropTypes.object.isRequired,
    toggle: PropTypes.func.isRequired,
    designDocs: PropTypes.array,
    toggledSections: PropTypes.object,
    selectedNav: PropTypes.shape({
      designDocName: PropTypes.string,
      designDocSection: PropTypes.string,
      indexName: PropTypes.string,
      navItem: PropTypes.string
    }).isRequired,
    isDbPartitioned: PropTypes.bool.isRequired,
    selectedPartitionKey: PropTypes.string,
    showDeleteIndexModal: PropTypes.func.isRequired,
    showCloneIndexModal: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    const list = FauxtonAPI.getExtensions('sidebar:list');
    this.sidebarListTypes = _.isUndefined(list) ? [] : list;
  }

  designDocList = () => {
    return _.map(this.props.designDocs, (designDoc, key) => {
      const ddName = decodeURIComponent(designDoc.safeId);
      const isDDocPartitioned = DocHelpers.isDDocPartitioned(designDoc, this.props.isDbPartitioned);

      // only pass down the selected nav info and toggle info if they're relevant for this particular design doc
      let expanded = false,
          toggledSections = {};
      if (_.has(this.props.toggledSections, ddName)) {
        expanded = this.props.toggledSections[ddName].visible;
        toggledSections = this.props.toggledSections[ddName].indexGroups;
      }

      let selectedNavInfo = {};
      if (this.props.selectedNav.navItem === 'designDoc' && this.props.selectedNav.designDocName === ddName) {
        selectedNavInfo = this.props.selectedNav;
      }

      return (
        <DesignDoc
          toggle={this.props.toggle}
          sidebarListTypes={this.sidebarListTypes}
          isExpanded={expanded}
          toggledSections={toggledSections}
          selectedNavInfo={selectedNavInfo}
          selectedPartitionKey={this.props.selectedPartitionKey}
          isPartitioned={isDDocPartitioned}
          key={key}
          designDoc={designDoc}
          designDocName={ddName}
          database={this.props.database}
          showDeleteIndexModal={this.props.showDeleteIndexModal}
          showCloneIndexModal={this.props.showCloneIndexModal} />
      );
    });
  };

  render() {
    return (
      <ul className="nav nav-list">
        {this.designDocList()}
      </ul>
    );
  }
}
