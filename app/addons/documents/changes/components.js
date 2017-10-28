import FauxtonAPI from "../../../core/api";

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

import React from "react";
import ReactDOM from "react-dom";
import Actions from "./actions";
import Stores from "./stores";
import Components from "../../fauxton/components";
import ReactComponents from "../../components/react-components";
import {TransitionMotion, spring, presets} from 'react-motion';
import "../../../../assets/js/plugins/prettify";
import uuid from 'uuid';

const store = Stores.changesStore;
const BadgeList = ReactComponents.BadgeList;
const {Copy} = ReactComponents;

class ChangesController extends React.Component {
  constructor (props) {
    super(props);
    this.state = this.getStoreState();
  }

  getStoreState () {
    return {
      changes: store.getChanges(),
      loaded: store.isLoaded(),
      databaseName: store.getDatabaseName(),
      isShowingSubset: store.isShowingSubset()
    };
  }

  onChange () {
    this.setState(this.getStoreState());
  }

  componentDidMount () {
    store.on('change', this.onChange, this);
  }

  componentWillUnmount () {
    store.off('change', this.onChange);
  }

  showingSubsetMsg () {
    const { isShowingSubset, changes } = this.state;
    let msg = '';
    if (isShowingSubset) {
      let numChanges = changes.length;
      msg = <p className="changes-result-limit">Limiting results to latest <b>{numChanges}</b> changes.</p>;
    }
    return msg;
  }

  getRows () {
    const { changes, loaded, databaseName } = this.state;
    if (!changes.length && loaded) {
      return (
        <p className="no-doc-changes">
          There are no document changes to display.
        </p>
      );
    }

    return changes.map((change, i) => {
      return <ChangeRow change={change} key={i} databaseName={databaseName} />;
    });
  }

  render () {
    return (
      <div>
        <div className="js-changes-view">
          {this.showingSubsetMsg()}
          {this.getRows()}
        </div>
      </div>
    );
  }
}


class ChangesTabContent extends React.Component {
  constructor (props) {
    super(props);
    this.state = this.getStoreState();
  }

  getStoreState () {
    return {
      filters: store.getFilters()
    };
  }

  onChange () {
    this.setState(this.getStoreState());
  }

  componentDidMount () {
    store.on('change', this.onChange, this);
  }

  componentWillUnmount () {
    store.off('change', this.onChange);
  }

  addFilter (newFilter) {
    if (_.isEmpty(newFilter)) {
      return;
    }
    Actions.addFilter(newFilter);
  }

  hasFilter (filter) {
    return store.hasFilter(filter);
  }

  render () {
    return (
      <div className="changes-header">
        <AddFilterForm filter={(label) => Actions.removeFilter(label)} addFilter={this.addFilter}
          hasFilter={this.hasFilter} />
        <BadgeList elements={this.state.filters} removeBadge={(label) => Actions.removeFilter(label)} />
      </div>
    );
  }
}


class AddFilterForm extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      filter: '',
      error: false
    };
    this.submitForm = this.submitForm.bind(this);
  }

  submitForm (e) {
    e.preventDefault();
    e.stopPropagation();

    if (this.props.hasFilter(this.state.filter)) {
      this.setState({ error: true });

      // Yuck. This removes the class after the effect has completed so it can occur again. The
      // other option is to use jQuery to add the flash. This seemed slightly less crumby
      let component = this;
      setTimeout(function () {
        component.setState({ error: false });
      }, 1000);
    } else {
      this.props.addFilter(this.state.filter);
      this.setState({ filter: '', error: false });
    }
  }

  componentDidMount () {
    this.focusFilterField();
  }

  componentDidUpdate () {
    this.focusFilterField();
  }

  focusFilterField () {
    ReactDOM.findDOMNode(this.refs.addItem).focus();
  }

  inputClassNames () {
    let className = 'js-changes-filter-field';
    if (this.state.error) {
      className += ' errorHighlight';
    }
    return className;
  }

  render () {
    return (
      <form className="form-inline js-filter-form" onSubmit={this.submitForm}>
        <fieldset>
          <i className="fonticon-filter" />
          <input type="text" ref="addItem" className={this.inputClassNames()} placeholder="Sequence or ID"
                 onChange={(e) => this.setState({ filter: e.target.value })} value={this.state.filter} />
          <button type="submit" className="btn btn-secondary">Filter</button>
          <div className="help-block"></div>
        </fieldset>
      </form>
    );
  }
}
AddFilterForm.PropTypes = {
  addFilter: PropTypes.func.isRequired,
  hasFilter: PropTypes.func.isRequired,
  tooltips: PropTypes.string
};
AddFilterForm.defaultProps = {
  tooltip: ''
};

class ChangeRow extends React.Component {
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
                uniqueKey={uuid.v4()}
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
                uniqueKey={uuid.v4()}
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

ChangeRow.PropTypes = {
  change: PropTypes.object,
  databaseName: PropTypes.string.isRequired
};


export class ChangesCodeTransition extends React.Component {
  willEnter () {
    return {
      opacity: spring(1, presets.gentle),
      height: spring(160, presets.gentle)
    };
  }

  willLeave () {
    return {
      opacity: spring(0, presets.gentle),
      height: spring(0, presets.gentle)
    };
  }

  getStyles (prevStyle) {
    if (!prevStyle && this.props.codeVisible) {
      return [{
        key: '1',
        style: this.willEnter()
      }];
    }

    if (!prevStyle && !this.props.codeVisible) {
      return [{
        key: '1',
        style: this.willLeave()
      }];
    }
    return prevStyle.map(item => {
      return {
        key: '1',
        style: item.style
      };
    });
  }

  getChildren (items) {
    const code =  items.map(({style}) => {
      if (this.props.codeVisible === false && style.opacity === 0) {
        return null;
      }
      return (
        <div key='1' style={{opacity: style.opacity, height: style.height + 'px'}}>
          <Components.CodeFormat
          code={this.props.code}
          />
        </div>
      );
    });

    return (
      <span>
        {code}
      </span>
    );
  }

  render () {
    return (
      <TransitionMotion
          styles={this.getStyles()}
          willLeave={this.willLeave}
          willEnter={this.willEnter}
        >
        {this.getChildren.bind(this)}
      </TransitionMotion>
    );
  }
}


class ChangeID extends React.Component {
  render () {
    const { deleted, id, databaseName } = this.props;
    if (deleted) {
      return (
        <span className="js-doc-id">{id}</span>
      );
    }
    const link = '#' + FauxtonAPI.urls('document', 'app', databaseName, id);
    return (
      <a href={link} className="js-doc-link">{id}</a>
    );
  }
}


export default {
  ChangesController,
  ChangesTabContent,
  ChangeRow,
  ChangeID
};
