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

import React from 'react';
import ReactDOM from "react-dom";
import ace from "brace";

require('brace/ext/static_highlight');
const highlight = ace.acequire('ace/ext/static_highlight');

require('brace/mode/json');
const JavaScriptMode = ace.acequire('ace/mode/json').Mode;

require('brace/theme/idle_fingers');
const theme = ace.acequire('ace/theme/idle_fingers');

export default class SplitScreenArea extends React.Component {

  constructor (props) {
    super(props);
  }

  componentDidUpdate () {
    this.hightlightAfterRender();
  }

  componentDidMount () {
    this.hightlightAfterRender();
  }

  hightlightAfterRender () {
    const format = (input) => { return JSON.stringify(input, null, '  '); };

    const jsmode = new JavaScriptMode();
    const left = this.revLeftOurs;
    const right = this.revRightTheirs;

    const leftRes = highlight.render(format(this.props.ours), jsmode, theme, 0, true);
    left.innerHTML = leftRes.html;
    const rightRes = highlight.render(format(this.props.theirs), jsmode, theme, 0, true);
    right.innerHTML = rightRes.html;
  }

  render () {
    const {ours, theirs} = this.props;

    if (!ours || !theirs) {
      return <div></div>;
    }

    return (
      <div className="revision-split-area">
        <div data-id="ours" style={{width: '50%'}}>
          <div style={{marginBottom: '20px'}}>{ours._rev} (Server-Selected Rev)</div>
          <pre ref={node => this.revLeftOurs = node}></pre>
        </div>

        <div data-id="theirs" style={{width: '50%'}}>
          <div style={{marginBottom: '20px'}}>{theirs._rev}</div>
          <pre ref={node => this.revRightTheirs = node}></pre>
        </div>
      </div>
    );
  }
}
