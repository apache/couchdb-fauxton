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

import PropTypes from 'prop-types';
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import FauxtonAPI from '../../../../core/api';
import Components from '../../../fauxton/components';
import ReactComponents from '../../../components/react-components';
import ChangesCodeTransition from './ChangesCodeTransition';
import ChangeID from './ChangeID';

const {Copy} = ReactComponents;

export default class ChangeRow extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      codeVisible: false
    };
  }

  toggleJSON (e) {
    e.preventDefault();
    this.setState({ codeVisible: !this.state.codeVisible });
  }

  getChangesCode () {
    return (this.state.codeVisible) ? <Components.CodeFormat key="changesCodeSection" code={this.getChangeCode()} /> : null;
  }

  getChangeCode () {
    return {
      changes: this.props.change.changes,
      doc: this.props.change.doc
    };
  }

  showCopiedMessage (target) {
    let msg = 'The document ID has been copied to your clipboard.';
    if (target === 'seq') {
      msg = 'The document seq number has been copied to your clipboard.';
    }
    FauxtonAPI.addNotification({
      msg: msg,
      type: 'info',
      clear: true
    });
  }

  render () {
    const { codeVisible } = this.state;
    const { change, databaseName } = this.props;
    const wrapperClass = 'change-wrapper' + (change.isNew ? ' new-change-row' : '');

    return (
      <div className={wrapperClass}>
        <div className="change-box" data-id={change.id}>
          <div className="row-fluid">
            <div className="span2">seq</div>
            <div className="span8 change-sequence">{change.seq}</div>
            <div className="span2 text-right">
              <Copy
                uniqueKey={uuidv4()}
                text={change.seq.toString()}
                onClipboardClick={() => this.showCopiedMessage('seq')} />
            </div>
          </div>

          <div className="row-fluid">
            <div className="span2">id</div>
            <div className="span8">
              <ChangeID id={change.id} deleted={change.deleted} databaseName={databaseName} />
            </div>
            <div className="span2 text-right">
              <Copy
                uniqueKey={uuidv4()}
                text={change.id}
                onClipboardClick={() => this.showCopiedMessage('id')} />
            </div>
          </div>

          <div className="row-fluid">
            <div className="span2">deleted</div>
            <div className="span10">{change.deleted ? 'True' : 'False'}</div>
          </div>

          <div className="row-fluid">
            <div className="span2">changes</div>
            <div className="span10">
              <button type="button" className='btn btn-small btn-secondary' onClick={this.toggleJSON.bind(this)}>
                {codeVisible ? 'Close JSON' : 'View JSON'}
              </button>
            </div>
          </div>

          <ChangesCodeTransition
            codeVisible={this.state.codeVisible}
            code={this.getChangeCode()}
          />
        </div>
      </div>
    );
  }
}

ChangeRow.propTypes = {
  change: PropTypes.object,
  databaseName: PropTypes.string.isRequired
};
