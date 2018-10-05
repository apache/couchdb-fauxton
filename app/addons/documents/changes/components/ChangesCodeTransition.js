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
import Components from '../../../fauxton/components';
import {TransitionMotion, spring, presets} from 'react-motion';
import '../../../../../assets/js/plugins/prettify';

export default class ChangesCodeTransition extends React.Component {
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

ChangesCodeTransition.propTypes = {
  code: PropTypes.object.isRequired,
  codeVisible: PropTypes.bool.isRequired
};
