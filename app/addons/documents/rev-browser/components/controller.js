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
import RevisionBrowserControls from './revisionbrowsercontrols';
import SplitScreenArea from './splitscreenarea';
import RevisionDiffArea from './revisiondiffarea';
import { ButtonGroup, Button } from "react-bootstrap";
import {LoadLines} from '../../../components/components/loadlines';


export default class DiffyController extends React.Component {

  constructor (props) {
    super(props);
    this.toggleDiffViewFalse = this.toggleDiffView.bind(this, false);
    this.toggleDiffViewTrue = this.toggleDiffView.bind(this, true);
  }

  componentDidMount () {
    this.props.toggleConfirmModal(false, null);
    this.props.initDiffEditor();
  }

  toggleDiffView (enableDiff) {
    this.props.toggleDiffView(enableDiff);
  }

  render () {
    const {tree, ours, theirs, conflictingRevs, isDiffViewEnabled} = this.props;

    if (!tree.length && !theirs) {
      return <LoadLines />;
    }

    // no conflicts happened for this doc
    if (!theirs || !conflictingRevs.length) {
      return <div style={{textAlign: 'center', color: '#fff'}}><h2>No conflicts</h2></div>;
    }

    return (
      <div className="revision-wrapper scrollable">
        <RevisionBrowserControls {...this.props} />
        <div className="revision-view-controls">
          <ButtonGroup className="two-sides-toggle-button">
            <Button
              style={{width: '120px'}}
              className={isDiffViewEnabled ? 'active' : ''}
              onClick={this.toggleDiffViewTrue}
            >
              <i className="icon-columns" /> Diff
            </Button>
            <Button
              style={{width: '120px'}}
              className={isDiffViewEnabled ? '' : 'active'}
              onClick={this.toggleDiffViewFalse}
            >
              <i className="icon-file-text" /> Document
            </Button>
          </ButtonGroup>
        </div>

        {isDiffViewEnabled ?
          <RevisionDiffArea ours={ours} theirs={theirs} /> :
          <SplitScreenArea ours={ours} theirs={theirs} /> }
      </div>
    );
  }
}
