import React, { Component } from "react";
import FauxtonAPI from "../../../../core/api";
import ReactComponents from "../../../components/react-components";
import MangoHelper from "../mango.helper";

const PaddedBorderedBox = ReactComponents.PaddedBorderedBox;
const CodeEditorPanel = ReactComponents.CodeEditorPanel;
const ConfirmButton = ReactComponents.ConfirmButton;

export default class MangoEditor extends Component {

  constructor(props) {
    super(props);
    this.defaultProps = {
      changedQuery: null,
      availableIndexes: null,
      additionalIndexes: null
    };
  }

  render() {
    const url = '#/' + FauxtonAPI.urls('allDocs', 'app', FauxtonAPI.url.encode(this.props.dbName), '');

    return (
      <div className="mango-editor-wrapper">
        <PaddedBorderedBox>
          <div
            dangerouslySetInnerHTML={{__html: this.props.description}}
            className="editor-description">
          </div>
        </PaddedBorderedBox>
        <PaddedBorderedBox>
          <strong>Database</strong>
          <div className="db-title">
            <a href={url}>{this.props.dbName}</a>
          </div>
        </PaddedBorderedBox>
        <form className="form-horizontal" onSubmit={this.props.onSubmit}>
          <PaddedBorderedBox>
            <CodeEditorPanel
              id="query-field"
              ref="field"
              title={this.props.title}
              docLink={this.props.docs}
              defaultCode={this.props.exampleCode} />
            {this.getChangedQueryText()}
          </PaddedBorderedBox>
          {this.getIndexBox()}
          <div className="padded-box">
            <div className="control-group">
              <ConfirmButton text={this.props.confirmbuttonText} id="create-index-btn" showIcon={false} />
            </div>
          </div>
        </form>
      </div>
    );
  }

  getChangedQueryText () {
    if (!this.props.changedQuery) {
      return null;
    }

    return (
      <div className="info-changed-query">
        <strong>Info:</strong>
        <div>We changed the default query based on the last Index you created.</div>
      </div>
    );
  }

  getIndexBox () {
    if (!this.props.availableIndexes) {
      return null;
    }

    return (
      <PaddedBorderedBox>
        <strong>Queryable indexes:</strong>
        <a className="edit-link" href={'#' + FauxtonAPI.urls('mango', 'index-app', encodeURIComponent(this.props.dbName))}>edit</a>
        <pre
          className="mango-available-indexes">
          {this.getIndexes('index', this.props.availableIndexes)}
          {this.getIndexes('additonal', this.props.additionalIndexes)}
        </pre>
      </PaddedBorderedBox>
    );
  }

  getIndexes (prefix, indexes) {
    if (!indexes) {
      return;
    }

    return indexes.map((index, i) => {
      return (
        <div key={prefix + i}>{ MangoHelper.getIndexName(index) }</div>
      );
    });
  }

  getEditorValue () {
    return this.refs.field.getValue();
  }

  getEditor () {
    return this.refs.field.getEditor();
  }

  hasErrors () {
    return this.getEditor().hasErrors();
  }
};

MangoEditor.propTypes = {
  dbName: React.PropTypes.string.isRequired,
  description: React.PropTypes.string.isRequired,
  title: React.PropTypes.string.isRequired,
  docs: React.PropTypes.string.isRequired,
  exampleCode: React.PropTypes.string.isRequired,
  confirmbuttonText: React.PropTypes.string.isRequired,
  availableIndexes: React.PropTypes.arrayOf(React.PropTypes.object),
  additionalIndexes: React.PropTypes.arrayOf(React.PropTypes.object),
  onSubmit: React.PropTypes.func.isRequired
};
