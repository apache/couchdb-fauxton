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

import FauxtonAPI from "../../../core/api";
import React from "react";
import Stores from "./stores";
import Actions from "./actions";
import ReactComponents from "../../components/react-components";
var designDocInfoStore = Stores.designDocInfoStore;
var LoadLines = ReactComponents.LoadLines;
var Copy = ReactComponents.Copy;
import uuid from 'uuid';


class DesignDocInfo extends React.Component {
  getStoreState = () => {
    return {
      viewIndex: designDocInfoStore.getViewIndex(),
      isLoading: designDocInfoStore.isLoading(),
      ddocName: designDocInfoStore.getDdocName()
    };
  };

  componentDidMount() {
    designDocInfoStore.on('change', this.onChange, this);
  }

  componentWillUnmount() {
    designDocInfoStore.off('change', this.onChange);
    Actions.stopRefresh();
  }

  onChange = () => {
    this.setState(this.getStoreState());
  };

  showCopiedMessage = () => {
    FauxtonAPI.addNotification({
      type: 'success',
      msg: 'The MD5 sha has been copied to your clipboard.',
      clear: true
    });
  };

  state = this.getStoreState();

  render() {
    var viewIndex = this.state.viewIndex;

    if (this.state.isLoading) {
      return <LoadLines />;
    }

    var actualSize = (viewIndex.data_size) ? viewIndex.data_size.toLocaleString('en') : 0;
    var dataSize = (viewIndex.disk_size) ? viewIndex.disk_size.toLocaleString('en') : 0;

    return (
      <div className="metadata-page">
        <header>
          <h2>_design/{this.state.ddocName} Metadata</h2>
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
                uniqueKey={uuid.v4()}
                text={viewIndex.signature}
                onClipboardClick={this.showCopiedMessage} />
            </li>
          </ul>

        </section>

      </div>
    );
  }
}


export default {
  DesignDocInfo: DesignDocInfo
};
