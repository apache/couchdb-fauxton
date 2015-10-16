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

define([
  'app',
  'api',
  'react',
  'addons/fauxton/dependencies/ZeroClipboard',

  // needed to run the test individually. Don't remove
  'velocity.ui'
],

function (app, FauxtonAPI, React, ZeroClipboard) {


  // the path to the swf depends on whether we're in a bundled environment (e.g. prod) or local
  function getZeroClipboardSwfPath () {
    var path = (app.bundled) ? 'js/fauxton' : 'app/addons/fauxton/dependencies';
    return app.root + path + '/ZeroClipboard.swf';
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
        textDisplay: 'Copy'
      };
    },

    componentWillMount: function () {
      ZeroClipboard.config({ moviePath: getZeroClipboardSwfPath() });
    },

    getClipboardElement: function () {
      if (this.props.displayType === 'icon') {
        return (<i className="fonticon-clipboard"></i>);
      }
      return this.props.textDisplay;
    },

    componentDidMount: function () {
      var el = this.getDOMNode();
      this.clipboard = new ZeroClipboard(el);
    },

    render: function () {
      return (
        <a href="#" ref="copy" className="copy" data-clipboard-text={this.props.text} data-bypass="true" title="Copy to clipboard">
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
    componentWillMount: function () {
      ZeroClipboard.config({ moviePath: getZeroClipboardSwfPath() });
    },

    componentDidMount: function () {
      var el = this.refs["copy-text-" + this.props.uniqueKey].getDOMNode();
      this.clipboard = new ZeroClipboard(el);
      this.clipboard.on('load', function () {
        this.clipboard.on('mouseup', function () {
          this.props.onClipBoardClick();
        }.bind(this));
      }.bind(this));
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
            className="fonticon-clipboard icon btn copy-button"
            data-clipboard-text={this.props.textToCopy}
            data-bypass="true"
            ref={"copy-text-" + this.props.uniqueKey}
            title="Copy to clipboard"
          >
            Copy
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
      $(this.refs.myself.getDOMNode()).velocity('transition.slideDownIn', FauxtonAPI.constants.MISC.TRAY_TOGGLE_SPEED, function () {
        if (done) {
          done(true);
        }
      });
    },

    hide: function (done) {
      $(this.refs.myself.getDOMNode()).velocity('reverse', FauxtonAPI.constants.MISC.TRAY_TOGGLE_SPEED, function () {
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

    getInitialState: function () {
      return {};
    },

    getDefaultProps: function () {
      return {
        perPage: FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE,
        page: 1,
        total: 0
      };
    },

    getVisiblePages: function (page, totalPages) {
      var from, to;
      if (totalPages < 10) {
        from = 1;
        to = totalPages + 1;
      } else {
        from = page - 5;
        to = page + 5;
        if (from <= 1) {
          from = 1;
          to = 11;
        }
        if (to > totalPages + 1) {
          from =  totalPages - 9;
          to = totalPages + 1;
        }
      }
      return {
        from: from,
        to: to
      };
    },

    createItemsForPage: function (visiblePages, page, prefix, suffix) {
      return _.range(visiblePages.from, visiblePages.to).map(function (i) {
        return (
          <li key={i} className={(page === i ? "active" : null)}>
            <a href={prefix + i + suffix}>{i}</a>
          </li>
        );
      });
    },

    render: function () {
      var page = this.state.page || this.props.page;
      var total = this.state.total || this.props.total;
      var perPage = this.props.perPage;
      var prefix = this.props.urlPrefix || "";
      var suffix = this.props.urlSuffix || "";
      var totalPages = total === 0 ? 1 : Math.ceil(total / perPage);
      var visiblePages = this.getVisiblePages(page, totalPages);
      var rangeItems = this.createItemsForPage(visiblePages, page, prefix, suffix);
      return (
        <ul className="pagination">
          <li className={(page === 1 ? "disabled" : null)}>
            <a href={prefix + Math.max(page - 1, 1) + suffix}>&laquo;</a>
          </li>
          {rangeItems}
          <li className={(page < totalPages ? null : "disabled")}>
            <a href={prefix + Math.min(page + 1, totalPages) + suffix}>&raquo;</a>
          </li>
        </ul>
      );
    }
  });


  // A super-simple replacement for window.confirm()
  var ConfirmationModal = React.createClass({
    propTypes: {
      visible: React.PropTypes.bool.isRequired,
      text: React.PropTypes.string.isRequired,
      onClose: React.PropTypes.func.isRequired,
      onSubmit: React.PropTypes.func.isRequired
    },

    getDefaultProps: function () {
      return {
        visible: false,
        title: 'Please confirm',
        text: '',
        onClose: function () { },
        onSubmit: function () { }
      };
    },

    componentDidUpdate: function () {
      var params = (this.props.visible) ? { show: true, backdrop: 'static', keyboard: true } : 'hide';
      $(this.getDOMNode()).modal(params);

      $(this.getDOMNode()).on('hidden.bs.modal', function () {
        this.props.onClose();
      }.bind(this));
    },

    render: function () {
      return (
        <div className="modal hide confirmation-modal fade" tabIndex="-1" data-js-visible={this.props.visible}>
          <div className="modal-header">
            <button type="button" className="close" onClick={this.props.onClose} aria-hidden="true">&times;</button>
            <h3>{this.props.title}</h3>
          </div>
          <div className="modal-body">
            <p>
              {this.props.text}
            </p>
          </div>
          <div className="modal-footer">
            <button className="btn" onClick={this.props.onClose}><i className="icon fonticon-cancel-circled"></i> Cancel</button>
            <button className="btn btn-success js-btn-success" onClick={this.props.onSubmit}><i className="fonticon-ok-circled"></i> Okay</button>
          </div>
        </div>
      );
    }
  });


  return {
    Clipboard: Clipboard,
    ClipboardWithTextField: ClipboardWithTextField,
    CodeFormat: CodeFormat,
    Tray: Tray,
    Pagination: Pagination,
    ConfirmationModal: ConfirmationModal
  };

});
