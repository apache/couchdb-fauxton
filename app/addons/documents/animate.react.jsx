/**
 * Adapted from https://gist.githubusercontent.com/tkafka/0d94c6ec94297bb67091/raw/5cc9b077c9bdaa86ca266766f886bbe9d014922d/VelocityTransitionGroup.jsx
 * I've filed a ticket to find out what license this is open sourced under: https://github.com/tkafka/react-VelocityTransitionGroup/issues/1
 */
define([
  'react',
  'velocity',
], function (React, Velocity) {

  var ReactTransitionGroup = React.addons.TransitionGroup;
  //var Velocity = require('velocity-animate');

  var transitions = {
    // Forcefeeding: property order = [after, before]
    'slide-forward': {
      duration: 200,
      enter: {
        translateX: [ '0%', '100%' ],
      },
      leave: {
        translateX: [ '-100%', '0%' ],
      }
    },
    'slide-back': {
      duration: 200,
      enter: {
        translateX: [ '0%', '-100%' ],
      },
      leave: {
        translateX: [ '100%', '0%' ],
      }
    },
    'slideover-forward': {
      duration: 200,
      enter: {
        translateX: [ '0%', '100%' ],
        zIndex: [ 1, 1 ]
      },
      leave: {
        // translateX: [ '0%', '0%' ],
        zIndex: [ 0, 0 ]
      }
    },
    'slideover-back': {
      duration: 200,
      enter: {
        // translateX: [ '0%', '0%' ],
        zIndex: [ 0, 0 ]
      },
      leave: {
        translateX: [ '100%', '0%' ],
        zIndex: [ 1, 1 ]
      }
    },
    'fadeInDown': {
      duration: 1000,
      enter: {
        opacity: [ 1, 0 ],
        height: ['690px', '0px']
      },
      leave: {
        opacity: [ 0, 1 ],
        height: ['0px', '690px']
      }
    },
    default: {
      duration: 200,
      enter: {
        opacity: [ 1, 0 ],
      },
      leave: {
        opacity: [ 0, 1 ],
      }
    }
  };

  var VelocityTransitionGroupChild = React.createClass({
    propTypes: {
      transitionName: React.PropTypes.string.isRequired,
    },
    _getTransition: function() {
      if (!transitions[this.props.transitionName]) {
        console.warn('TransitionName ' + this.props.transitionName + ' wasn\'t found in VelocityTransitionGroupChild transitions.');
      }
      return transitions[this.props.transitionName] || transitions.default;
    },

    componentWillEnter: function(done) {
      var node = this.getDOMNode();
      var transition = this._getTransition();
      Velocity(
        node,
        transition.enter,
        {
          duration: transition.duration,
          complete: done
        });
    },

    componentWillLeave: function(done) {
      var node = this.getDOMNode();
      var transition = this._getTransition();
      Velocity(
        node,
        transition.leave,
        {
          duration: transition.duration,
          complete: done
        });
    },

    render: function() {
      return React.Children.only(this.props.children);
    }
  });

  var VelocityTransitionGroup = React.createClass({
    propTypes: {
      transitionName: React.PropTypes.string.isRequired,
    },

    _wrapChild: function(child) {
      return (
        <VelocityTransitionGroupChild
          transitionName={this.props.transitionName}
          >
          {child}
        </VelocityTransitionGroupChild>
      );
    },

    render: function() {
      return (
        <ReactTransitionGroup
          {...this.props}
          childFactory={this._wrapChild}
        />
      );
    }
  });

  return VelocityTransitionGroup;
});
