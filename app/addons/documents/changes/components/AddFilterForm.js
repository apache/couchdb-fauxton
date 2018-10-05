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
import ReactDOM from 'react-dom';

export default class AddFilterForm extends React.Component {
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
    this.addItem.focus();
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
          <input
            type="text"
            ref={node => this.addItem = node}
            className={this.inputClassNames()}
            placeholder="Sequence or ID"
            onChange={(e) => this.setState({ filter: e.target.value })}
            value={this.state.filter} />
          <button type="submit" className="btn btn-secondary">Filter</button>
          <div className="help-block"></div>
        </fieldset>
      </form>
    );
  }
}

AddFilterForm.propTypes = {
  addFilter: PropTypes.func.isRequired,
  hasFilter: PropTypes.func.isRequired,
  tooltips: PropTypes.string
};
AddFilterForm.defaultProps = {
  tooltip: ''
};
