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
import {Overlay} from 'react-bootstrap';
import {TransitionMotion, spring} from 'react-motion';

export const TrayContents = React.createClass({
  propTypes: {
    contentVisible: React.PropTypes.bool.isRequired,
    closeTray: React.PropTypes.func.isRequired,
    onEnter: React.PropTypes.func,
    container: React.PropTypes.object
  },

  defaultProps: {
    onEnter: () => {},
    container: this
  },

  getChildren (items) {
    const {style} = items[0];
    var className = "tray show-tray " + this.props.className;
    return (
      <div key={'1'} id={this.props.id} style={{opacity: style.opacity, top: style.top + 'px'}} className={className}>
        {this.props.children}
      </div>);
  },

  willEnter () {
    return {
      opacity: spring(1),
      top: spring(55)
    };
  },

  willLeave () {
    return {
      opacity: spring(0),
      top: spring(30)
    };
  },

  getDefaultStyles () {
    return [{key: '1', style: {opacity: 0, top: 30}}];
  },

  getStyles (prevStyle) {
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
  },

  render () {
    return (
      <Overlay
       show={this.props.contentVisible}
       onHide={this.props.closeTray}
       placement={"bottom"}
       container={this.props.container}
       rootClose={true}
       target={() => ReactDOM.findDOMNode(this.refs.target)}
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
});


export const connectToStores = (Component, stores, getStateFromStores) => {

  var WrappingElement = React.createClass({

    componentDidMount () {
      stores.forEach(function (store) {
        store.on('change', this.onChange, this);
      }.bind(this));
    },

    componentWillUnmount () {
      stores.forEach(function (store) {
        store.off('change', this.onChange);
      }.bind(this));
    },

    getInitialState () {
      return getStateFromStores(this.props);
    },

    onChange () {
      this.setState(getStateFromStores(this.props));
    },

    handleStoresChanged () {
      this.setState(getStateFromStores(this.props));
    },

    render () {
      return <Component {...this.state} {...this.props} />;
    }

  });

  return WrappingElement;
};

export const TrayWrapper = React.createClass({
  getDefaultProps () {
    return {
      className: ''
    };
  },

  renderChildren () {
    return React.Children.map(this.props.children, function (child) {

      const props = {};
      Object.keys(this.props).filter((k) => {
        return this.props.hasOwnProperty(k);
      }).map((k) => {
        return props[k] = this.props[k];
      });

      return React.cloneElement(child, props);
    }.bind(this));
  },

  render () {
    return (
      <div>
        {this.renderChildren()}
      </div>
    );
  }
});
