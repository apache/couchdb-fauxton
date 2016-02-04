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
  '../../components/react-components.react'
],

function (app, FauxtonAPI, React, Stores, Actions, ReactComponents) {
  var designDocInfoStore = Stores.designDocInfoStore;
  var LoadLines = ReactComponents.LoadLines;


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

    render: function () {
      var formatSize = app.helpers.formatSize;
      var getDocUrl = app.helpers.getDocUrl;
      var viewIndex = this.state.viewIndex;

      if (this.state.isLoading) {
        return <LoadLines />;
      }

      return (
      <div className="metadata-page">
        <header className="page-header">
          <h2>Design Document Metadata: _design/{this.state.ddocName} </h2>
          <p className="help">Information about the specified design document, including the index,
            index size and current status of the design document and associated index information.
            <a href={getDocUrl('DESIGN_DOC_METADATA')} className="help-link" target="_blank" data-bypass="true">
              <i className="icon-question-sign" />
              </a>
          </p>
        </header>
        <div className="row-fluid">
          <div className="span6">
            <header>
              <h3>Status</h3>
            </header>
            <dl>
              <dt>Updater</dt>
              <dd>{viewIndex.updater_running}</dd>
              <dt>Compact</dt>
              <dd>{viewIndex.compact_running }</dd>
              <dt>Waiting Commit</dt>
              <dd>{viewIndex.waiting_commit }</dd>
              <dt>Waiting Clients</dt>
              <dd>{viewIndex.waiting_clients }</dd>
              <dt>Update Sequence</dt>
              <dd>{viewIndex.update_seq }</dd>
              <dt>Purge Sequence</dt>
              <dd>{viewIndex.purge_seq }</dd>
            </dl>
          </div>
          <div className="span6">
            <header>
              <h3>Information</h3>
            </header>
            <dl>
              <dt>Language</dt>
              <dd>{viewIndex.language }</dd>
              <dt>Signature</dt>
              <dd>{viewIndex.signature }</dd>
            </dl>
            <header>
              <h3>Storage</h3>
            </header>
            <dl>
              <dt>Data Size</dt>
              <dd>{formatSize(viewIndex.data_size) }</dd>
              <dt>Disk Size</dt>
              <dd>{formatSize(viewIndex.disk_size) }</dd>
            </dl>
          </div>
        </div>
      </div>
      );
    }
  });



  return {
    DesignDocInfo: DesignDocInfo
  };
});
