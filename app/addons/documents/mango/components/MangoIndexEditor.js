import React, { Component } from "react";
import app from "../../../../app";
import FauxtonAPI from "../../../../core/api";
import MangoEditor from "./MangoEditor";

const getDocUrl = app.helpers.getDocUrl;

export default class MangoIndexEditor extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    //this.props.fetchAndLoadIndexList();
  }

  getMangoEditor () {
    return this.refs.mangoEditor;
  }

  render () {
    return (
      <MangoEditor
        ref="mangoEditor"
        description={this.props.description}
        dbName={this.props.databaseName}
        onSubmit={(ev) => {this.saveQuery(ev);}}
        title="Index"
        docs={getDocUrl('MANGO_INDEX')}
        exampleCode={this.props.queryIndexCode}
        confirmbuttonText="Create Index" />
    );
  }

  saveQuery (event) {
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

    this.props.saveQuery({
      database: this.props.database,
      queryCode: this.getMangoEditor().getEditorValue(),
    });
  }
}

MangoIndexEditor.propTypes = {
  description: React.PropTypes.string.isRequired,
  databaseName: React.PropTypes.string.isRequired,
  saveQuery: React.PropTypes.func.isRequired,
  queryIndexCode: React.PropTypes.string.isRequired
};
