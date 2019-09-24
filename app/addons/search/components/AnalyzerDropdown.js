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
import GeneralComponents from '../../components/react-components';

const StyledSelect = GeneralComponents.StyledSelect;

export default class AnalyzerDropdown extends React.Component {
  static defaultProps = {
    defaultSelected: 'standard',
    label: 'Type',
    id: 'analyzer-default',
    classes: '',
    onChange: function () { }
  };
  static propTypes = {
    defaultSelected: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    classes: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
  };

  getAnalyzers = () => {
    const analyzers = [
      'Standard', 'Keyword', 'Simple', 'Whitespace', 'Classic', 'Email'
    ];
    return analyzers.map((i) => {
      return (<option value={i.toLowerCase()} key={i}>{i}</option>);
    });
  };

  getLanguages = () => {
    const languages = [
      'Arabic', 'Armenian', 'Basque', 'Bulgarian', 'Brazilian', 'Catalan', 'Cjk', 'Chinese', 'Czech',
      'Danish', 'Dutch', 'English', 'Finnish', 'French', 'Galician', 'German', 'Greek', 'Hindi', 'Hungarian',
      'Indonesian', 'Irish', 'Italian', 'Japanese', 'Latvian', 'Norwegian', 'Persian', 'Polish', 'Portuguese',
      'Romanian', 'Russian', 'Spanish', 'Swedish', 'Thai', 'Turkish'
    ];
    return languages.map((lang) => {
      return (<option value={lang.toLowerCase()} key={lang}>{lang}</option>);
    });
  };

  getLabel = () => {
    return this.props.label === '' ? null : <label htmlFor={this.props.id}>{this.props.label}</label>;
  };

  render() {
    const languages =
      <optgroup label="Language-specific" key="languages">
        {this.getLanguages()}
      </optgroup>;

    return (
      <div className={this.props.classes}>
        {this.getLabel()}
        <StyledSelect
          selectChange={this.props.onChange}
          selectValue={this.props.defaultSelected}
          selectId={this.props.id}
          selectContent={[this.getAnalyzers(), languages]}
        />
      </div>
    );
  }
}
