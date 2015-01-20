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
  "api",
  "react",
  "addons/cors/stores",
  "addons/cors/resources",
  "addons/cors/actions"
], function (FauxtonAPI, React, Stores, Resources, Actions) {
  var corsStore = Stores.corsStore;

  var validateOrigin = function (origin) {
    if (!Resources.validateCORSDomain(origin)) {
      FauxtonAPI.addNotification({
        msg: 'Please enter a valid domain, starting with http/https and only containing the domain (not a subfolder).',
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

    editOrigin: function (event) {
      event.preventDefault();
      this.setState({edit: !this.state.edit});
    },

    updateOrigin: function (event) {
      event.preventDefault();
      if (!validateOrigin(this.state.updatedOrigin)) {
        return;
      }
      this.props.updateOrigin(this.state.updatedOrigin, this.props.origin);
      this.setState({edit: false});
    },

    deleteOrigin: function (event) {
      event.preventDefault();
      if (!window.confirm('Are you sure you want to delete ' + this.props.origin)) {
        return;
      }

      this.props.deleteOrigin(this.props.origin);
    },

    onInputChange: function (event) {
      this.setState({updatedOrigin: event.target.value});
    },

    createOriginDisplay: function () {
      if (this.state.edit) {
        return (
          <div className="input-append edit-domain-section">
            <input type="text" className="span11" name="update_origin_domain" onChange={this.onInputChange} value={this.state.updatedOrigin}/>
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
            { display }
          </td>
          <td width="30">
            <span className="fonticon-pencil" onClick={this.editOrigin} title="Click to edit"></span>
          </td>
          <td width="30">
            <span className="fonticon-trash" onClick={this.deleteOrigin} title="Click to delete"></span>
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
          deleteOrigin={this.props.deleteOrigin}
          key={i} origin={origin}
        />;
      }, this);
    },

    render: function () {
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

      this.props.addOrigin(this.state.origin);
      this.setState({origin: ''});
    },

    render: function () {
      if (!this.props.isVisible) {
        return null;
      }

      return (
        <div id= "origin-domains-container">
          <div className= "origin-domains">
            <div className="input-append">
              <input type="text" className="span12" name="new_origin_domain" onChange={this.onInputChange} value={this.state.origin} placeholder="e.g., https://site.com"/>
              <button onClick={this.addOrigin} className="btn btn-primary add-domain"> Add </button>
            </div>
          </div>
        </div>
      );
    }

  });

  var Origins = React.createClass({

    onOriginChange: function (event) {
      console.log('boom');
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
            <input type="radio" checked={this.props.isAllOrigins} value="all" onChange={this.onOriginChange} name="all-domains"/> All origin domains ( * )
          </label>
          <label className="radio">
            <input type="radio" checked={!this.props.isAllOrigins} value="selected" onChange={this.onOriginChange} name="selected-domains"/> Restrict to specific origin domains
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
        isAllOrigins: corsStore.isAllOrigins()
      };
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    componentDidMount: function () {
      corsStore.on('change', this.onChange, this);
    },

    componentWillUnmount: function() {
      corsStore.off('change', this.onChange);
    },

    onChange: function () {
      this.setState(this.getStoreState());
    },

    enableCorsChange: function (event) {
      Actions.toggleEnableCors();
    },

    save: function (event) {
      event.preventDefault();

      Actions.saveCors({
        enableCors: this.state.corsEnabled,
        origins: this.state.origins
      });
    },

    deleteOrigin: function (origin) {
      Actions.deleteOrigin(origin);
    },

    originChange: function (isAllOrigins) {
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

    render: function () {
      var isVisible = _.all([this.state.corsEnabled, !this.state.isAllOrigins]);
      var className = this.state.corsEnabled ? 'collapsing-container' : '';

      return (
        <div className="cors-page">
          <header id="cors-header">
            <p>Cross-Origin Resource Sharing (CORS) lets you connect to remote servers directly from the browser, so you can host browser-based apps on static pages and talk directly with CouchDB to load your data.</p>
          </header>

          <form id="corsForm" onSubmit={this.save}>
            <div className="cors-enable">
              <label className="checkbox">
                <input type="checkbox" checked={this.state.corsEnabled} onChange={this.enableCorsChange} /> Enable CORS
              </label>
            </div>
            <div id={className}>
              <Origins corsEnabled={this.state.corsEnabled} originChange={this.originChange} isAllOrigins={this.state.isAllOrigins}/>
              <OriginTable updateOrigin={this.updateOrigin} deleteOrigin={this.deleteOrigin} isVisible={isVisible} origins={this.state.origins} />
              <OriginInput addOrigin={this.addOrigin} isVisible={isVisible} />
            </div>

            <div className="form-actions">
              <input className="btn btn-success" type="submit" value="Save" />
            </div>

          </form>
        </div>
      );
    }
  });

  return {
    renderCORS: function (el) {
      React.render(React.createElement(CORSController, null), el);
    },

    removeCORS: function (el) {
      React.unmountComponentAtNode(el);
    },

    OriginInput: OriginInput,
    Origins: Origins,
    OriginTable: OriginTable,
    OriginRow: OriginRow
  };
});
