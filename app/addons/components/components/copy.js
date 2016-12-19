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

// Locates the specific element on the DOM, configures the clipboard, and
// sets the callback on 'success' (usually a Fauxton notification).
export const initializeClipboard = (uniqueKey, cb) => {
  clipboard = new Clipboard('#copy-' + uniqueKey);
  clipboard.on('success', function(e) {
    cb();
  });
};

// Cleans up the fake elements left around by clipboard.js
export const destroyClipboard = () => {
  clipboard.destroy();
};

export class Copy extends React.Component {
  componentDidMount () {
    initializeClipboard(this.props.uniqueKey, this.props.onClipboardClick);
  }

  componentWillUnmount () {
    destroyClipboard();
  }

  // Necessary for copy elements that are not unmounted even though they are
  // no longer visible (ex. Notification  rows in the notification center).
  componentDidUpdate () {
    initializeClipboard(this.props.uniqueKey, this.props.onClipboardClick);
  }

  getClipboardElement () {
    if (this.props.displayType === 'icon') {
      return (<i className="fontawesome icon-paste"></i>);
    }
    return this.props.textDisplay;
  }

  getClipboardButton () {
    const btnClasses = this.props.displayType === 'input' ? "btn copy-button" : "copy" + " clipboard-copy-element";
    return (
      <button
        className={btnClasses}
        data-clipboard-text={this.props.text}
        title={this.props.title}
        id={"copy-" + this.props.uniqueKey}
      >
        {this.getClipboardElement()}
      </button>
    );
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
          {this.getClipboardButton()}
        </p>
      );
    }
    return (
      this.getClipboardButton()
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
  uniqueKey: React.PropTypes.string.isRequired,
  onClipboardClick: React.PropTypes.func.isRequired
};