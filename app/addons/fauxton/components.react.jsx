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

import app from "../../app";
import FauxtonAPI from "../../core/api";
import React from "react";
import ReactDOM from "react-dom";
import ZeroClipboard from "zeroclipboard";
import { Modal } from "react-bootstrap";
import "velocity-animate/velocity";
import "velocity-animate/velocity.ui";
import "zeroclipboard/dist/ZeroClipboard.swf";

function getZeroClipboardSwfPath () {
  return './dashboard.assets/ZeroClipboard.swf';
}

// super basic right now, but can be expanded later to handle all the varieties of copy-to-clipboards
// (target content element, custom label, classes, notifications, etc.)
var Clipboard = React.createClass({
  propTypes: function () {
    return {
      text: React.PropTypes.string.isRequired,
      displayType: React.PropTypes.string.oneOf(['icon', 'text'])
    };
  },

  getDefaultProps: function () {
    return {
      displayType: 'icon',
      textDisplay: 'Copy',
      onClipboardClick: function () { },
      title: 'Copy to clipboard'
    };
  },

  componentWillMount: function () {
    ZeroClipboard.config({ swfPath: getZeroClipboardSwfPath() });
  },

  getClipboardElement: function () {
    if (this.props.displayType === 'icon') {
      return (<i className="fontawesome icon-paste"></i>);
    }
    return this.props.textDisplay;
  },

  componentDidMount: function () {
    var el = ReactDOM.findDOMNode(this);
      this.clipboard = new ZeroClipboard(el);
      this.clipboard.on('ready', function () {
        this.clipboard.on('copy', function () {
          this.props.onClipboardClick();
        }.bind(this));
      }.bind(this));

      this.clipboard.on('error', function (event) {
        console.log('ZeroClipboard error of type "' + event.name + '": ' + event.message);
      });
  },

  onClick: function (event) {
    event.preventDefault();
  },

  render: function () {
    return (
      <a href="#"
        onClick={this.onClick}
        ref="copy"
        className="copy clipboard-copy-element"
        data-clipboard-text={this.props.text}
        data-bypass="true"
        title={this.props.title}
      >
        {this.getClipboardElement()}
      </a>
    );
  }
});

// use like this:
//  <ComponentsReact.ClipboardWithTextField textToCopy={yourText} uniqueKey={someUniqueValue}>
//  </ComponentsReact.ClipboardWithTextField>
// pass in the text and a unique key, the key has to be unique or you'll get a warning
var ClipboardWithTextField = React.createClass({
  propTypes: {
    onClipBoardClick: React.PropTypes.func.isRequired,
    textToCopy: React.PropTypes.string.isRequired,
    uniqueKey: React.PropTypes.string.isRequired,
    showCopyIcon: React.PropTypes.bool
  },

  getDefaultProps: function () {
    return {
      showCopyIcon: true,
      text: 'Copy'
    };
  },

  componentWillMount: function () {
    ZeroClipboard.config({ swfPath: getZeroClipboardSwfPath() });
  },

  componentDidMount: function () {
    var el = ReactDOM.findDOMNode(this.refs["copy-text-" + this.props.uniqueKey]);
    this.clipboard = new ZeroClipboard(el);
    this.clipboard.on('ready', function () {
      this.clipboard.on('copy', function () {
        this.props.onClipBoardClick();
      }.bind(this));
    }.bind(this));
  },

  getCopyIcon: function () {
    if (!this.props.showCopyIcon) {
      return null;
    }
    return (<i className="fontawesome icon-paste"></i>);
  },

  render: function () {
    return (
      <p key={this.props.uniqueKey}>
        <input
          type="text"
          className="input-xxlarge text-field-to-copy"
          readOnly
          value={this.props.textToCopy} />
        <a
          id={"copy-text-" + this.props.uniqueKey}
          className="btn copy-button clipboard-copy-element"
          data-clipboard-text={this.props.textToCopy}
          data-bypass="true"
          ref={"copy-text-" + this.props.uniqueKey}
          title="Copy to clipboard"
        >
          {this.getCopyIcon()} {this.props.text}
        </a>
      </p>
    );
  }
});

// formats a block of code and pretty-prints it in the page. Currently uses the prettyPrint plugin
var CodeFormat = React.createClass({
  getDefaultProps: function () {
    return {
      lang: "js"
    };
  },

  getClasses: function () {
    // added for forward compatibility. This component defines an api via it's props so you can pass lang="N" and
    // not the class that prettyprint requires for that lang. If (when, hopefully!) we drop prettyprint we won't
    // have any change this component's props API and break things
    var classMap = {
      js: 'lang-js'
    };

    var classNames = 'prettyprint';
    if (_.has(classMap, this.props.lang)) {
      classNames += ' ' + classMap[this.props.lang];
    }
    return classNames;
  },

  componentDidMount: function () {
    // this one function is all the lib offers. It parses the entire page and pretty-prints anything with
    // a .prettyprint class; only executes on an element once
    prettyPrint();
  },

  render: function () {
    var code = JSON.stringify(this.props.code, null, " ");
    return (
      <div><pre className={this.getClasses()}>{code}</pre></div>
    );
  }
});

var _NextTrayInternalId = 0;
var Tray = React.createClass({

  propTypes: {
    onAutoHide: React.PropTypes.func
  },

  getDefaultProps: function () {
    return {
      onAutoHide: function () { }
    };
  },

  getInitialState: function () {
    return {
      show: false,
      internalid: (_NextTrayInternalId++)
    };
  },

  toggle: function (done) {
    if (this.state.show) {
      this.hide(done);
    } else {
      this.show(done);
    }
  },

  setVisible: function (visible, done) {
    if (this.state.show && !visible) {
      this.hide(done);
    } else if (!this.state.show && visible) {
      this.show(done);
    }
  },

  componentDidMount: function () {
    $('body').on('click.Tray-' + this.state.internalid, function (e) {
      var tgt = $(e.target);
      if (this.state.show && tgt.closest('.tray').length === 0) {
        this.hide();
        this.props.onAutoHide();
      }
    }.bind(this));
  },

  componentWillUnmount: function () {
    $('body').off('click.Tray-' + this.state.internalid);
  },

  show: function (done) {
    this.setState({show: true});
    $(ReactDOM.findDOMNode(this.refs.myself)).velocity('transition.slideDownIn', FauxtonAPI.constants.MISC.TRAY_TOGGLE_SPEED, function () {
      if (done) {
        done(true);
      }
    });
  },

  hide: function (done) {
    $(ReactDOM.findDOMNode(this.refs.myself)).velocity('reverse', FauxtonAPI.constants.MISC.TRAY_TOGGLE_SPEED, function () {
      this.setState({show: false});
      if (done) {
        done(false);
      }
    }.bind(this));
  },

  render: function () {
    var styleSpec = this.state.show ? {"display": "block", "opacity": 1} :  {"display": "none", "opacity": 0};
    var classSpec = this.props.className || "";
    classSpec += " tray";
    return (
      <div ref="myself" style={styleSpec} className={classSpec}>{this.props.children}</div>
    );
  }
});


var Pagination = React.createClass({

  getDefaultProps: function () {
    return {
      perPage: FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE,
      onClick: null,
      page: 1,
      total: 0,
      urlPrefix: '',
      urlSuffix: '',
      maxNavPages: 10
    };
  },

  getVisiblePages: function (page, totalPages) {
    var from, to;
    if (totalPages < this.props.maxNavPages) {
      from = 1;
      to = totalPages + 1;
    } else {
      var halfMaxNavPages = Math.floor(this.props.maxNavPages / 2);
      from = page - halfMaxNavPages;
      to = page + halfMaxNavPages;
      if (from <= 1) {
        from = 1;
        to = this.props.maxNavPages + 1;
      }
      if (to > totalPages + 1) {
        from = totalPages - (this.props.maxNavPages - 1);
        to = totalPages + 1;
      }
    }
    return {
      from: from,
      to: to
    };
  },

  createItemsForPage: function (visiblePages) {
    return _.range(visiblePages.from, visiblePages.to).map(function (i) {
      return (
        <li key={i} className={(this.props.page === i ? 'active' : null)}>
          {this.getLink(i, i)}
        </li>
      );
    }.bind(this));
  },

  getLink: function (i, label) {
    if (this.props.onClick) {
      return (
        <a onClick={this.props.onClick.bind(null, i)} dangerouslySetInnerHTML={{__html: label}}></a>
      );
    }
    return (
      <a href={this.props.urlPrefix + i + this.props.urlSuffix} dangerouslySetInnerHTML={{__html: label}}></a>
    );
  },

  getTotalPages: function () {
    return this.props.total === 0 ? 1 : Math.ceil(this.props.total / this.props.perPage);
  },

  render: function () {
    var totalPages = this.getTotalPages();
    var visiblePages = this.getVisiblePages(this.props.page, totalPages);
    var rangeItems = this.createItemsForPage(visiblePages);
    var prevPage = Math.max(this.props.page - 1, 1);
    var nextPage = Math.min(this.props.page + 1, totalPages);

    return (
      <ul className="pagination">
        <li className={(this.props.page === 1 ? "disabled" : null)}>
          {this.getLink(prevPage, '&laquo;')}
        </li>
        {rangeItems}
        <li className={(this.props.page < totalPages ? null : "disabled")}>
          {this.getLink(nextPage, '&raquo;')}
        </li>
      </ul>
    );
  }
});


// a super-simple replacement for window.confirm()
var ConfirmationModal = React.createClass({
  propTypes: {
    visible: React.PropTypes.bool.isRequired,
    text: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.element
    ]).isRequired,
    onClose: React.PropTypes.func.isRequired,
    onSubmit: React.PropTypes.func.isRequired
  },

  getDefaultProps: function () {
    return {
      visible: false,
      title: 'Please confirm',
      text: '',
      successButtonLabel: 'Okay',
      buttonClass: 'btn-success',
      onClose: function () { },
      onSubmit: function () { }
    };
  },

  close: function (e) {
    if (e) {
      e.preventDefault();
    }
    this.props.onClose();
  },

  render: function () {
    var content = <p>{this.props.text}</p>;
    if (!_.isString(this.props.text)) {
      content = this.props.text;
    }
    var btnClasses = 'btn ' + this.props.buttonClass;

    return (
      <Modal dialogClassName="confirmation-modal" show={this.props.visible} onHide={this.close}>
        <Modal.Header closeButton={true}>
          <Modal.Title>{this.props.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {content}
        </Modal.Body>
        <Modal.Footer>
          <a href="#" data-bypass="true" className="cancel-link" onClick={this.close}>Cancel</a>
          <button className={btnClasses} onClick={this.props.onSubmit}>
            <i className="fonticon-ok-circled"></i> {this.props.successButtonLabel}
          </button>
        </Modal.Footer>
      </Modal>
    );
  }
});


export default {
  Clipboard: Clipboard,
  ClipboardWithTextField: ClipboardWithTextField,
  CodeFormat: CodeFormat,
  Tray: Tray,
  Pagination: Pagination,
  ConfirmationModal: ConfirmationModal
};
