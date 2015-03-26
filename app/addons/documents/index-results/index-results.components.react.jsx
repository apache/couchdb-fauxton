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
  'addons/documents/index-results/stores',
  'addons/documents/index-results/actions',
  'addons/components/react-components.react',
  'addons/documents/resources',

  "plugins/prettify"
],

function (app, FauxtonAPI, React, Stores, Actions, Components, Documents) {
  var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
  var store = Stores.indexResultsStore;

  var NoResultScreen = React.createClass({
    render: function () {
      return (
        <div className="watermark-logo">
          <h3>{this.props.text}</h3>
        </div>
      );
    }
  });

  var ResultsScreen = React.createClass({

    onDoubleClick: function (id, doc) {
      FauxtonAPI.navigate(doc.url);
    },

    getUrlFragment: function (url) {
      if (!this.props.isEditable) {
        return null;
      }

      return (
        <a href={url}>
          <i className="fonticon-pencil"></i>
        </a>);
    },

    getDocumentList: function () {
      return _.map(this.props.results, function (doc) {

        return (
         <Components.Document
           key={doc.id}
           doc={doc}
           onDoubleClick={this.onDoubleClick}
           keylabel={doc.keylabel}
           docContent={doc.content}
           checked={this.props.isSelected(doc.id)}
           docChecked={this.props.docChecked}
           isDeletable={doc.isDeletable}
           docIdentifier={doc.id} >
           {this.getUrlFragment('#' + doc.url)}
         </Components.Document>
       );
      }, this);
    },

    render: function () {
      var classNames = 'view';
      var loadLines = null;

      if (this.props.isLoading) {
        loadLines = <Components.LoadLines />;
      }

      if (this.props.isListDeletable) {
        classNames += ' show-select';
      }

      return (
      <div className={classNames}>
        {loadLines}

        <div id="doc-list">
          <ReactCSSTransitionGroup transitionName={'slow-fade'}>
            {this.getDocumentList()}
          </ReactCSSTransitionGroup>
        </div>
      </div>
      );
    },

    componentDidMount: function () {
      prettyPrint();
    },

    componentDidUpdate: function () {
      prettyPrint();
    },

  });

  var ViewResultListController = React.createClass({
    getStoreState: function () {
      return {
        hasResults: store.hasResults(),
        results: store.getResults(),
        isListDeletable: store.isListDeletable(),
        isSelected: store.isSelected,
        isLoading: store.isLoading(),
        isEditable: store.isEditable(),
        textEmptyIndex: store.getTextEmptyIndex()
      };
    },

    isSelected: function (id) {
      return this.state.isSelected(id);
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    componentDidMount: function () {
      store.on('change', this.onChange, this);
    },

    componentWillUnmount: function () {
      store.off('change', this.onChange);
    },

    onChange: function () {
      this.setState(this.getStoreState());
    },

    docChecked: function (id) {
      Actions.selectDoc(id);
    },

    render: function () {
      var view = <NoResultScreen text={this.state.textEmptyIndex}/>;

      if (this.state.hasResults) {
        view = <ResultsScreen
          isCollapsed={this.isCollapsed}
          isSelected={this.isSelected}
          isEditable={this.state.isEditable}
          isListDeletable={this.state.isListDeletable}
          docChecked={this.docChecked}
          isLoading={this.state.isLoading}
          results={this.state.results} />;
      }

      return (
        view
      );
    }
  });

  var Views = {
    renderViewResultList: function (el) {
      React.render(<ViewResultListController />, el);
    },
    removeViewResultList: function (el) {
      React.unmountComponentAtNode(el);
    },
    List: ViewResultListController,
    ResultsScreen: ResultsScreen
  };

  return Views;
});
