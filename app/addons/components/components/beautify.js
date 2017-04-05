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

export const Beautify = React.createClass({
  noOfLines () {
    return this.props.code.split(/\r\n|\r|\n/).length;
  },

  canBeautify () {
    return this.noOfLines() === 1;
  },

  addTooltip () {
    if (this.canBeautify) {
      $('.beautify-tooltip').tooltip({ placement: 'right' });
    }
  },

  componentDidMount () {
    this.addTooltip();
  },

  beautify (event) {
    event.preventDefault();
    var beautifiedCode = beautifyHelper(this.props.code);
    this.props.beautifiedCode(beautifiedCode);
    $('.beautify-tooltip').tooltip('hide');
  },

  render () {
    if (!this.canBeautify()) {
      return null;
    }

    return (
      <button
        onClick={this.beautify}
        className="beautify beautify_map btn btn-primary btn-small beautify-tooltip"
        type="button"
        data-toggle="tooltip"
        title="Switch to editable code format."
      >
        Format Code
      </button>
    );
  }
});
