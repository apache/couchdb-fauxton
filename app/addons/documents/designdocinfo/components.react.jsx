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
  '../../../core/api',
  'react',
  './stores',
  './actions',
  '../../components/react-components.react',
  '../../fauxton/components.react'
],

function (app, FauxtonAPI, React, Stores, Actions, ReactComponents, GeneralComponents) {
  var designDocInfoStore = Stores.designDocInfoStore;
  var LoadLines = ReactComponents.LoadLines;
  var Clipboard = GeneralComponents.Clipboard;


  var DesignDocInfo = React.createClass({
    getStoreState: function () {
      return {
        viewIndex: designDocInfoStore.getViewIndex(),
        isLoading: designDocInfoStore.isLoading(),
        ddocName: designDocInfoStore.getDdocName()
      };
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    componentDidMount: function () {
      designDocInfoStore.on('change', this.onChange, this);
    },

    componentWillUnmount: function () {
      designDocInfoStore.off('change', this.onChange);
      Actions.stopRefresh();
    },

    onChange: function () {
      this.setState(this.getStoreState());
    },

    showCopiedMessage: function () {
      FauxtonAPI.addNotification({
        type: 'success',
        msg: 'The MD5 sha has been copied to your clipboard.',
        clear: true
      });
    },

    render: function () {
      var getDocUrl = app.helpers.getDocUrl;
      var viewIndex = this.state.viewIndex;

      if (this.state.isLoading) {
        return <LoadLines />;
      }

      var actualSize = (viewIndex.data_size) ? viewIndex.data_size.toLocaleString('en') : 0;
      var dataSize = (viewIndex.disk_size) ? viewIndex.disk_size.toLocaleString('en') : 0;

      return (
        <div className="metadata-page">
          <header>
            <div className="preheading">Design Document Metadata</div>
            <h2>_design/{this.state.ddocName}</h2>

            <p className="help">
              Information about the specified design document, including the index, index size and current status of the
              design document and associated index information.
              <a href={getDocUrl('DESIGN_DOC_METADATA')} className="help-link" target="_blank" data-bypass="true">
                <i className="icon-question-sign" />
              </a>
            </p>
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
                <Clipboard
                  onClipboardClick={this.showCopiedMessage}
                  text={viewIndex.signature} />
              </li>
            </ul>

          </section>

        </div>
      );
    }
  });


  return {
    DesignDocInfo: DesignDocInfo
  };

});
