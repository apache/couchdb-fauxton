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
import beautifyHelper from "../../../../assets/js/plugins/beautify";
import {Tooltip, OverlayTrigger} from 'react-bootstrap';

const helper = beautifyHelper.js_beautify ? beautifyHelper.js_beautify : beautifyHelper;

export class Beautify extends React.Component {
  noOfLines = () => {
    return this.props.code.split(/\r\n|\r|\n/).length;
  };

  canBeautify = () => {
    return this.noOfLines() === 1;
  };

  beautify = (event) => {
    event.preventDefault();
    var beautifiedCode = helper(this.props.code);
    this.props.beautifiedCode(beautifiedCode);
  };

  getTooltip = () => {
    return (
      <Tooltip id="tooltip">
      Switch to editable code format.
      </Tooltip>
    );
  };

  render() {
    if (!this.canBeautify()) {
      return null;
    }

    const tooltip = this.getTooltip();

    return (
      <OverlayTrigger placement="right" overlay={tooltip}>
        <button
          onClick={this.beautify}
          className="beautify beautify_map btn btn-primary btn-small beautify-tooltip"
          type="button"
        >
          Format Code
        </button>
      </OverlayTrigger>
    );
  }
}
