// Licensed under the Apache License, Version 2.0 (the 'License'); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.

import React from 'react';
import ReactDOM from 'react-dom';
import Clipboard from 'clipboard';

let clipboard;

export const initializeClipboard = (cb) => {
  clipboard = new Clipboard('.copy');
  clipboard.on('success', function(e) {
    cb();
  });
};

export const destroyClipboard = () => {
  clipboard.destroy();
};

export class Copy extends React.Component {
  componentDidMount () {
    initializeClipboard(this.props.onClipboardClick);
  }

  componentWillUnmount () {
    destroyClipboard();
  }

  getClipboardElement () {
    if (this.props.displayType === 'icon') {
      return (<i className="fontawesome icon-paste"></i>);
    }
    return this.props.textDisplay;
  }

  render () {
    if (this.props.displayType === 'input') {
      return (
        <p>
          <input
            type="text"
            className="input-xxlarge text-field-to-copy"
            readOnly
            value={this.props.text} />
          <button
            className="btn copy-button clipboard-copy-element"
            data-clipboard-text={this.props.text}
            title={this.props.title}
          >
            {this.props.textDisplay}
          </button>
        </p>
      );
    }
    return (
      <button className="copy clipboard-copy-element"
              title={this.props.title}
              data-clipboard-text={this.props.text}
      >
        {this.getClipboardElement()}
      </button>
    );
  }
};

Copy.defaultProps = {
  displayType: 'icon',
  textDisplay: 'Copy',
  title: 'Copy to clipboard',
  onClipboardClick: function () { }
};

Copy.propTypes = {
  text: React.PropTypes.string.isRequired,
  displayType: React.PropTypes.oneOf(['icon', 'text', 'input']),
  onClipboardClick: React.PropTypes.func.isRequired
};



/*

var ClipboardWithTextField = React.createClass({
  propTypes: {
    onClipBoardClick: React.PropTypes.func.isRequired,
    textToCopy: React.PropTypes.string.isRequired,
    uniqueKey: React.PropTypes.string.isRequired,
    showCopyIcon: React.PropTypes.bool
  },

  getDefaultProps: function () {
    return {
      showCopyIcon: true,
      text: 'Copy'
    };
  },

  componentWillMount: function () {
    ZeroClipboard.config({ swfPath: getZeroClipboardSwfPath() });
  },

  componentDidMount: function () {
    var el = ReactDOM.findDOMNode(this.refs["copy-text-" + this.props.uniqueKey]);
    this.clipboard = new ZeroClipboard(el);
    this.clipboard.on('ready', function () {
      this.clipboard.on('copy', function () {
        this.props.onClipBoardClick();
      }.bind(this));
    }.bind(this));
  },

  getCopyIcon: function () {
    if (!this.props.showCopyIcon) {
      return null;
    }
    return (<i className="fontawesome icon-paste"></i>);
  },

  render: function () {
    return (
      <p key={this.props.uniqueKey}>
        <input
          type="text"
          className="input-xxlarge text-field-to-copy"
          readOnly
          value={this.props.textToCopy} />
        <a
          id={"copy-text-" + this.props.uniqueKey}
          className="btn copy-button clipboard-copy-element"
          data-clipboard-text={this.props.textToCopy}
          data-bypass="true"
          ref={"copy-text-" + this.props.uniqueKey}
          title="Copy to clipboard"
        >
          {this.getCopyIcon()} {this.props.text}
        </a>
      </p>
    );
  }
});
*/
