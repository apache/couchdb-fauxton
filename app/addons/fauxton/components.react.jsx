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
  'plugins/zeroclipboard/ZeroClipboard'
],

function (app, FauxtonAPI, React, ZeroClipboard) {

  // super basic right now, but can be expanded later to handle all the varieties of copy-to-clipboards
  // (target content element, custom label, classes, notifications, etc.)
  var Clipboard = React.createClass({
    propTypes: function () {
      return {
        text: React.PropTypes.string.isRequired
      };
    },

    componentWillMount: function () {
      ZeroClipboard.config({ moviePath: app.zeroClipboardPath });
    },

    componentDidMount: function () {
      var el = this.getDOMNode();
      this.clipboard = new ZeroClipboard(el);
    },

    render: function () {
      return (
        <a href="#" ref="copy" data-clipboard-text={this.props.text} data-bypass="true" title="Copy to clipboard">
          <i className="fonticon-clipboard"></i>
        </a>
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


  return {
    Clipboard: Clipboard,
    CodeFormat: CodeFormat
  };

});
