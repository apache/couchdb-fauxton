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
import ReactCSSTransitionGroup from "react-addons-css-transition-group";
import {Overlay} from 'react-bootstrap';

//With React 15.2.0 it validates props and throws a warning if props to a component are not acceptable
//this means that with the overlay it will try and pass custom props to a div which causes the overlay to stop working
//using a custom component gets around this.
const OverlayWarningEater = ({children}) => {
  return children;
};

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

  getChildren () {
    var className = "tray show-tray " + this.props.className;
    return (
      <div key={1} id={this.props.id} className={className}>
        {this.props.children}
      </div>);
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
        <OverlayWarningEater>
          <ReactCSSTransitionGroup transitionName="tray" transitionAppear={true} component="div" transitionAppearTimeout={500}
            transitionEnterTimeout={500} transitionLeaveTimeout={300}>
            {this.getChildren()}
          </ReactCSSTransitionGroup>
        </OverlayWarningEater>
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
      if (!this.isMounted()) {
        return;
      }

      this.setState(getStateFromStores(this.props));
    },

    handleStoresChanged () {
      if (this.isMounted()) {
        this.setState(getStateFromStores(this.props));
      }
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
