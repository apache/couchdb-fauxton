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
import ReactDOM from 'react-dom';
import ChangeRow from './ChangeRow';

export default class ChangesScreen extends React.Component {
  constructor (props) {
    super(props);
    this.props.loadChanges(this.props.databaseName);
  }

  showingSubsetMsg () {
    const { isShowingSubset, changes } = this.props;
    let msg = '';
    if (isShowingSubset) {
      let numChanges = changes.length;
      msg = <p className="changes-result-limit">Limiting results to latest <b>{numChanges}</b> changes.</p>;
    }
    return msg;
  }

  getRows () {
    const { changes, loaded, databaseName } = this.props;
    if (!changes.length && loaded) {
      return (
        <p className="no-doc-changes">
          There are no document changes to display.
        </p>
      );
    }

    return changes.map((change, i) => {
      return <ChangeRow change={change} key={i} databaseName={databaseName} />;
    });
  }

  render () {
    return (
      <div>
        <div className="js-changes-view">
          {this.showingSubsetMsg()}
          {this.getRows()}
        </div>
      </div>
    );
  }
}

ChangesScreen.propTypes = {
  changes: PropTypes.array.isRequired,
  loaded: PropTypes.bool.isRequired,
  databaseName: PropTypes.string.isRequired,
  isShowingSubset: PropTypes.bool.isRequired,
  loadChanges: PropTypes.func.isRequired
};
