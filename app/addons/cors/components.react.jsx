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

import app from "../../app";
import FauxtonAPI from "../../core/api";
import React from "react";
import Stores from "./stores";
import Resources from "./resources";
import Actions from "./actions";
import ReactComponents from "../components/react-components.react";
import FauxtonComponents from "../fauxton/components.react";
var LoadLines = ReactComponents.LoadLines;
var ConfirmationModal = FauxtonComponents.ConfirmationModal;

var corsStore = Stores.corsStore;


var validateOrigin = function (origin) {
  if (!Resources.validateCORSDomain(origin)) {
    FauxtonAPI.addNotification({
      msg: 'Please enter a valid domain, starting with http/https.',
      type: 'error',
      clear: true
    });

    return false;
  }

  return true;
};


var OriginRow = React.createClass({

  getInitialState: function () {
    return {
      edit: false,
      updatedOrigin: this.props.origin
    };
  },

  editOrigin: function (e) {
    e.preventDefault();
    this.setState({ edit: !this.state.edit });
  },

  updateOrigin: function (e) {
    e.preventDefault();
    if (!validateOrigin(this.state.updatedOrigin)) {
      return;
    }
    this.props.updateOrigin(this.state.updatedOrigin, this.props.origin);
    this.setState({ edit: false });
  },

  deleteOrigin: function (e) {
    e.preventDefault();
    Actions.showDeleteDomainModal(this.props.origin);
  },

  onInputChange: function (event) {
    this.setState({ updatedOrigin: event.target.value });
  },

  onKeyUp: function (e) {
    if (e.keyCode === 13) {   //enter key
      return this.updateOrigin(e);
    }
  },

  createOriginDisplay: function () {
    if (this.state.edit) {
      return (
        <div className="input-append edit-domain-section">
          <input type="text" name="update_origin_domain" onChange={this.onInputChange} onKeyUp={this.onKeyUp} value={this.state.updatedOrigin} />
          <button onClick={this.updateOrigin} className="btn btn-primary update-origin"> Update </button>
        </div>
      );
    }
    return <div className="js-url url-display">{this.props.origin}</div>;
  },

  render: function () {
    var display = this.createOriginDisplay();
    return (
      <tr>
        <td>
          {display}
        </td>
        <td width="30">
          <span>
            <a className="fonticon-pencil" onClick={this.editOrigin} title="Click to edit" />
          </span>
        </td>
        <td width="30">
          <span>
            <a href="#" data-bypass="true" className="fonticon-trash" onClick={this.deleteOrigin} title="Click to delete" />
          </span>
        </td>
      </tr>
    );
  }

});

var OriginTable = React.createClass({

  createRows: function () {
    return _.map(this.props.origins, function (origin, i) {
      return <OriginRow
        updateOrigin={this.props.updateOrigin}
        key={i} origin={origin} />;
    }, this);
  },

  render: function () {
    if (!this.props.origins) {
      return null;
    }

    if (!this.props.isVisible || this.props.origins.length === 0) {
      return null;
    }

    var origins = this.createRows();

    return (
      <table id="origin-domain-table" className="table table-striped">
        <tbody>
          {origins}
        </tbody>
      </table>
    );
  }

});

var OriginInput = React.createClass({
  getInitialState: function () {
    return {
      origin: ''
    };
  },

  onInputChange: function (e) {
    this.setState({origin: e.target.value});
  },

  addOrigin: function (event) {
    event.preventDefault();
    if (!validateOrigin(this.state.origin)) {
      return;
    }

    var url = Resources.normalizeUrls(this.state.origin);

    this.props.addOrigin(url);
    this.setState({origin: ''});
  },

  onKeyUp: function (e) {
    if (e.keyCode == 13) {   //enter key
      return this.addOrigin(e);
    }
  },

  render: function () {
    if (!this.props.isVisible) {
      return null;
    }

    return (
      <div id="origin-domains-container">
        <div className="origin-domains">
          <div className="input-append">
            <input type="text" name="new_origin_domain" onChange={this.onInputChange} onKeyUp={this.onKeyUp} value={this.state.origin} placeholder="e.g., https://site.com"/>
            <button onClick={this.addOrigin} className="btn btn-primary add-domain"> Add </button>
          </div>
        </div>
      </div>
    );
  }

});

var Origins = React.createClass({

  onOriginChange: function (event) {
    if (event.target.value === 'all' && this.props.isAllOrigins) {
      return;   // do nothing if all origins is already selected
    }
    if (event.target.value === 'selected' && !this.props.isAllOrigins) {
      return;   // do nothing if specific origins is already selected
    }

    this.props.originChange(event.target.value === 'all');
  },

  render: function () {

    if (!this.props.corsEnabled) {
      return null;
    }

    return (
      <div>
        <p><strong> Origin Domains </strong> </p>
        <p>Databases will accept requests from these domains: </p>
        <label className="radio">
          <input type="radio" checked={this.props.isAllOrigins} value="all" onChange={this.onOriginChange} name="all-domains"/> All domains ( * )
        </label>
        <label className="radio">
          <input type="radio" checked={!this.props.isAllOrigins} value="selected" onChange={this.onOriginChange} name="selected-domains"/> Restrict to specific domains
        </label>
      </div>
    );
  }
});

var CORSController = React.createClass({

  getStoreState: function () {
    return {
      corsEnabled: corsStore.isEnabled(),
      origins: corsStore.getOrigins(),
      isAllOrigins: corsStore.isAllOrigins(),
      configChanged: corsStore.hasConfigChanged(),
      shouldSaveChange: corsStore.shouldSaveChange(),
      node: corsStore.getNode(),
      isLoading: corsStore.getIsLoading(),
      deleteDomainModalVisible: corsStore.isDeleteDomainModalVisible(),
      domainToDelete: corsStore.getDomainToDelete()
    };
  },

  getInitialState: function () {
    return this.getStoreState();
  },

  componentDidMount: function () {
    corsStore.on('change', this.onChange, this);
  },

  componentWillUnmount: function () {
    corsStore.off('change', this.onChange);
  },

  componentDidUpdate: function () {
    if (this.state.shouldSaveChange) {
      this.save();
    }
  },

  onChange: function () {
    this.setState(this.getStoreState());
  },

  enableCorsChange: function () {
    if (this.state.corsEnabled && !_.isEmpty(this.state.origins)) {
      var result = window.confirm(app.i18n.en_US['cors-disable-cors-prompt']);
      if (!result) { return; }
    }

    Actions.toggleEnableCors();
  },

  save: function () {
    Actions.saveCors({
      enableCors: this.state.corsEnabled,
      origins: this.state.origins,
      node: this.state.node
    });
  },

  originChange: function (isAllOrigins) {
    if (isAllOrigins && !_.isEmpty(this.state.origins)) {
      var result = window.confirm('Are you sure? Switching to all origin domains will overwrite your specific origin domains.');
      if (!result) { return; }
    }

    Actions.originChange(isAllOrigins);
  },

  addOrigin: function (origin) {
    Actions.addOrigin(origin);
  },

  updateOrigin: function (updatedOrigin, originalOrigin) {
    Actions.updateOrigin(updatedOrigin, originalOrigin);
  },

  methodChange: function (httpMethod) {
    Actions.methodChange(httpMethod);
  },

  deleteOrigin: function () {
    Actions.deleteOrigin(this.state.domainToDelete);
  },

  render: function () {
    var isVisible = _.all([this.state.corsEnabled, !this.state.isAllOrigins]);

    var originSettings = (
      <div id={this.state.corsEnabled ? 'collapsing-container' : ''}>
        <Origins corsEnabled={this.state.corsEnabled} originChange={this.originChange} isAllOrigins={this.state.isAllOrigins}/>
        <OriginTable updateOrigin={this.updateOrigin} isVisible={isVisible} origins={this.state.origins} />
        <OriginInput addOrigin={this.addOrigin} isVisible={isVisible} />
      </div>
    );

    if (this.state.isLoading) {
      originSettings = (<LoadLines />);
    }
    var deleteMsg = <span>Are you sure you want to delete <code>{_.escape(this.state.domainToDelete)}</code>?</span>;

    return (
      <div className="cors-page flex-body">
        <header id="cors-header">
          <p>{app.i18n.en_US['cors-notice']}</p>
        </header>

        <form id="corsForm" onSubmit={this.save}>
          <div className="cors-enable">
            {this.state.corsEnabled ? 'Cors is currently enabled.' : 'Cors is currently disabled.'}
            <br />
            <button
              type="button"
              className="enable-disable btn btn-success"
              onClick={this.enableCorsChange}
              disabled={this.state.isLoading ? 'disabled' : null}
            >
              {this.state.corsEnabled ? 'Disable CORS' : 'Enable CORS'}
            </button>
          </div>
          {originSettings}
        </form>

        <ConfirmationModal
          title="Confirm Deletion"
          visible={this.state.deleteDomainModalVisible}
          text={deleteMsg}
          buttonClass="btn-danger"
          onClose={Actions.hideDeleteDomainModal}
          onSubmit={this.deleteOrigin}
          successButtonLabel="Delete Domain" />
      </div>
    );
  }
});


export default {
  CORSController: CORSController,
  OriginInput: OriginInput,
  Origins: Origins,
  OriginTable: OriginTable,
  OriginRow: OriginRow
};
