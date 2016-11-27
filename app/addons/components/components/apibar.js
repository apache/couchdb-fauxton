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

import React from "react";
import ReactDOM from "react-dom";
import FauxtonAPI from "../../../core/api";
import {TrayContents, TrayWrapper, connectToStores} from './tray';
import FauxtonComponents from "../../fauxton/components.react";
import Actions from "../actions";
import Stores from "../stores";
import {ToggleHeaderButton} from './toggleheaderbutton';
const { componentStore } = Stores;

export const APIBar = React.createClass({
  propTypes: {
    buttonVisible: React.PropTypes.bool.isRequired,
    contentVisible: React.PropTypes.bool.isRequired,
    docURL: React.PropTypes.string,
    endpoint: React.PropTypes.string
  },

  showCopiedMessage () {
    FauxtonAPI.addNotification({
      msg: 'The API URL has been copied to the clipboard.',
      type: 'success',
      clear: true
    });
  },

  getDocIcon () {
    if (!this.props.docURL) {
      return null;
    }
    return (
      <a
        className="help-link"
        data-bypass="true"
        href={this.props.docURL}
        target="_blank"
      >
        <i className="icon icon-question-sign"></i>
      </a>
    );
  },

  getTray () {
    if (!this.props.contentVisible) {
      return null;
    }
    let endpoint = FauxtonAPI.url.decode(this.props.endpoint)
    return (
      <TrayContents className="tray show-tray api-bar-tray">
        <div className="input-prepend input-append">
          <span className="add-on">
            API URL
            {this.getDocIcon()}
          </span>

          <FauxtonComponents.ClipboardWithTextField
            onClipBoardClick={this.showCopiedMessage}
            text="Copy URL"
            textToCopy={endpoint}
            showCopyIcon={false}
            uniqueKey="clipboard-apiurl" />

          <div className="add-on">
            <a
              data-bypass="true"
              href={endpoint}
              target="_blank"
              className="btn"
            >
              View JSON
            </a>
          </div>
        </div>
      </TrayContents>
    );
  },

  toggleTrayVisibility () {
    Actions.toggleApiBarVisibility(!this.props.contentVisible);
  },

  componentDidMount () {
    $('body').on('click.APIBar', function (e) {

      if (!$('.show-tray.api-bar-tray').length) {
        return;
      }

      if ($(e.target).closest('.api-bar-tray,.control-toggle-api-url').length === 0) {
        Actions.toggleApiBarVisibility(false);
      }
    }.bind(this));
  },

  componentWillUnmount () {
    $('body').off('click.APIBar');
  },

  render () {
    if (!this.props.buttonVisible || !this.props.endpoint) {
      return null;
    }

    return (
      <div>
        <ToggleHeaderButton
          containerClasses="header-control-box control-toggle-api-url"
          title="API URL"
          fonticon="fonticon-link"
          text="API"
          toggleCallback={this.toggleTrayVisibility} />

        {this.getTray()}
      </div>
    );
  }
});

export const ApiBarController = React.createClass({

  getWrap () {
    return connectToStores(TrayWrapper, [componentStore], function () {
      return {
        buttonVisible: componentStore.getIsAPIBarButtonVisible(),
        contentVisible: componentStore.getIsAPIBarVisible(),
        endpoint: componentStore.getEndpoint(),
        docURL: componentStore.getDocURL()
      };
    });
  },

  render () {
    var TrayWrapper = this.getWrap();
    return (
      <TrayWrapper>
        <APIBar buttonVisible={true} contentVisible={false} />
      </TrayWrapper>
    );
  }
});
