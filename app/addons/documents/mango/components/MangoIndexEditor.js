import React, { Component } from "react";
import app from "../../../../app";
import FauxtonAPI from "../../../../core/api";
// import MangoEditor from "./MangoEditor";

const getDocUrl = app.helpers.getDocUrl;

export default class MangoIndexEditor extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    //this.props.fetchAndLoadIndexList();
  }

  getMangoEditor () {
    return this.refs.codeEditor;
  }

  editor() {
    const editQueryURL = '#' + FauxtonAPI.urls('mango', 'query-app', encodeURIComponent(this.props.databaseName));
    return (
      <div className="mango-editor-wrapper">
        <form className="form-horizontal" onSubmit={(ev) => {this.saveQuery(ev);}}>
          <PaddedBorderedBox>
            <CodeEditorPanel
              id="query-field"
              ref="codeEditor"
              title="Index"
              docLink={getDocUrl('MANGO_INDEX')}
              defaultCode={this.props.queryIndexCode} />
          </PaddedBorderedBox>
          <div className="padded-box">
            <div className="control-group">
              <ConfirmButton text="Create index" id="create-index-btn" showIcon={false} />
              <a className="edit-link" href={editQueryURL}>edit query</a>
            </div>
          </div>
        </form>
      </div>
    );
  }

  render () {
    return this.editor();
  }

  saveIndex (event) {
    event.preventDefault();

    if (this.getMangoEditor().hasErrors()) {
      FauxtonAPI.addNotification({
        msg:  'Please fix the Javascript errors and try again.',
        type: 'error',
        clear: true
      });
      return;
    }

    // Actions.saveQuery({
    //   database: this.props.database,
    //   queryCode: this.getMangoEditor().getEditorValue()
    // });

    this.props.saveIndex({
      database: this.props.database,
      queryCode: this.getMangoEditor().getValue(),
    });
  }
}

MangoIndexEditor.propTypes = {
  // description: React.PropTypes.string.isRequired,
  databaseName: React.PropTypes.string.isRequired,
  saveIndex: React.PropTypes.func.isRequired,
  queryIndexCode: React.PropTypes.string.isRequired
};
