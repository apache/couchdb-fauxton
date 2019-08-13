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
import {Overlay} from 'react-bootstrap';
import {TransitionMotion, spring} from 'react-motion';

export class TrayContents extends React.Component {
  static propTypes = {
    contentVisible: PropTypes.bool.isRequired,
    closeTray: PropTypes.func.isRequired,
    onEnter: PropTypes.func,
    container: PropTypes.object
  };

  static defaultProps = {
    onEnter: () => {}
  };

  constructor (props) {
    super(props);
    if (!props.container) {
      this.container = this;
    }
  }

  getChildren = (items) => {
    const {style} = items[0];
    const className = "tray show-tray " + this.props.className;
    return (
      <div key={'1'} id={this.props.id} style={{opacity: style.opacity, top: style.top + 'px'}} className={className}>
        {this.props.children}
      </div>);
  };

  willEnter = () => {
    return {
      opacity: spring(1),
      top: spring(64)
    };
  };

  willLeave = () => {
    return {
      opacity: spring(0),
      top: spring(30)
    };
  };

  getDefaultStyles = () => {
    return [{key: '1', style: {opacity: 0, top: 30}}];
  };

  getStyles = (prevStyle) => {
    if (!prevStyle) {
      return [{
        key: '1',
        style: this.willEnter()
      }];
    }
    return prevStyle.map(item => {
      return {
        key: '1',
        style: item.style
      };
    });
  };

  render() {
    return (
      <Overlay
        show={this.props.contentVisible}
        onHide={this.props.closeTray}
        placement={"bottom"}
        container={this.props.container}
        rootClose={true}
        onEnter={this.props.onEnter}
      >
        <TransitionMotion
          defaultStyles={this.getDefaultStyles()}
          styles={this.getStyles()}
          willLeave={this.willLeave}
          willEnter={this.willEnter}
        >
          {this.getChildren}
        </TransitionMotion>
      </Overlay>
    );
  }
}


export const connectToStores = (Component, stores, getStateFromStores) => {
  class WrappingElement extends React.Component {
    state = getStateFromStores(this.props);

    componentDidMount() {
      stores.forEach(store => {
        store.on('change', this.onChange, this);
      });
    }

    componentWillUnmount() {
      stores.forEach(function (store) {
        store.off('change', this.onChange);
      }.bind(this));
    }

    onChange = () => {
      this.setState(getStateFromStores(this.props));
    };

    handleStoresChanged = () => {
      this.setState(getStateFromStores(this.props));
    };

    render() {
      return <Component {...this.state} {...this.props} />;
    }
  }

  return WrappingElement;
};

export class TrayWrapper extends React.Component {
  static defaultProps = {
    className: ''
  };

  renderChildren = () => {
    return React.Children.map(this.props.children, (child) => {

      const props = {};
      Object.keys(this.props).filter((k) => {
        return Object.prototype.hasOwnProperty.call(this.props, k);
      }).map((k) => {
        return props[k] = this.props[k];
      });

      return React.cloneElement(child, props);
    });
  };

  render() {
    return (
      <div>
        {this.renderChildren()}
      </div>
    );
  }
}
