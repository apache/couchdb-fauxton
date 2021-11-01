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
import { v4 as uuidv4 } from 'uuid';
import FauxtonAPI from '../../../../core/api';
import ReactComponents from '../../../components/react-components';

const LoadLines = ReactComponents.LoadLines;
const Copy = ReactComponents.Copy;

export default class DesignDocInfo extends React.Component {

  constructor(props) {
    super(props);
    this.fetchDDocInfo();
  }

  componentDidUpdate(prevProps) {
    if (this.props.designDocInfo !== prevProps.designDocInfo) {
      this.fetchDDocInfo();
    }
  }

  componentWillUnmount() {
    this.props.stopRefresh();
  }

  fetchDDocInfo() {
    this.props.fetchDesignDocInfo({
      designDocName: this.props.designDocName,
      designDocInfo: this.props.designDocInfo
    });
  }

  showCopiedMessage = () => {
    FauxtonAPI.addNotification({
      type: 'success',
      msg: 'The MD5 sha has been copied to your clipboard.',
      clear: true
    });
  };

  render() {
    if (this.props.isLoading) {
      return <LoadLines />;
    }
    if (this.props.showLoadError) {
      return (
        <div className="metadata-page">
          <header>
            <h2>_design/{this.props.designDocName} Metadata</h2>
          </header>

          <section className="container">
            Error retrieving metadata. Try reloading the page.
          </section>
        </div>
      );
    }
    const viewIndex = this.props.viewIndex;
    const {sizes} = viewIndex;
    const actualSize = (sizes.active) ? sizes.active.toLocaleString('en') : 0;
    const dataSize = (sizes.external) ? sizes.external.toLocaleString('en') : 0;

    return (
      <div className="metadata-page">
        <header>
          <h2>_design/{this.props.designDocName} Metadata</h2>
        </header>

        <section className="container">
          <h3>Index Information</h3>

          <ul>
            <li>
              <span className="item-title">Language:</span>
              <span className="capitalize">{viewIndex.language}</span>
            </li>
            <li>
              <span className="item-title">Currently being updated?</span>
              {viewIndex.updater_running ? 'Yes' : 'No'}
            </li>
            <li>
              <span className="item-title">Currently running compaction?</span>
              {viewIndex.compact_running ? 'Yes' : 'No'}
            </li>
            <li>
              <span className="item-title">Waiting for a commit?</span>
              {viewIndex.waiting_commit ? 'Yes' : 'No'}
            </li>
          </ul>

          <ul>
            <li>
              <span className="item-title">Clients waiting for the index:</span>
              {viewIndex.waiting_clients}
            </li>
            <li>
              <span className="item-title">Update sequence on DB:</span>
              {viewIndex.update_seq}
            </li>
            <li>
              <span className="item-title">Processed purge sequence:</span>
              {viewIndex.purge_seq}
            </li>
            <li>
              <span className="item-title">Actual data size (bytes):</span>
              {actualSize}
            </li>
            <li>
              <span className="item-title">Data size on disk (bytes):</span>
              {dataSize}
            </li>
          </ul>

          <ul>
            <li>
              <span className="item-title">MD5 Signature:</span>
              <Copy
                uniqueKey={uuidv4()}
                text={viewIndex.signature}
                onClipboardClick={this.showCopiedMessage} />
            </li>
          </ul>

        </section>

      </div>
    );
  }
}

DesignDocInfo.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  showLoadError: PropTypes.bool.isRequired,
  viewIndex: PropTypes.object,
  designDocName: PropTypes.string.isRequired,
  stopRefresh: PropTypes.func.isRequired,
  fetchDesignDocInfo: PropTypes.func.isRequired
};
