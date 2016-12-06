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
  displayType: React.PropTypes.oneOf(['icon', 'text']),
  onClipboardClick: React.PropTypes.func.isRequired
};
