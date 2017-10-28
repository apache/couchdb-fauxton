import React, { Component } from "react";
import app from "../../../app";
import ReactComponents from "../../components/react-components";
import FauxtonComponents from "../../fauxton/components";
import Origins from "./Origins";
import OriginInput from "./OriginInput";
import OriginTable from "./OriginTable";

const LoadLines = ReactComponents.LoadLines;
const ConfirmationModal = FauxtonComponents.ConfirmationModal;

export default class CORSScreen extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.fetchAndLoadCORSOptions();
  }

  enableCorsChange() {
    const { corsEnabled, origins, node } = this.props;
    if (corsEnabled && !_.isEmpty(origins)) {
      const result = window.confirm(app.i18n.en_US['cors-disable-cors-prompt']);
      if (!result) { return; }
    }
    this.props.saveCORS({
      corsEnabled: !corsEnabled,
      origins: origins,
      node: node
    });
  }

  save() {
    this.props.saveCORS({
      corsEnabled: this.props.corsEnabled,
      origins: this.props.origins,
      node: this.props.node
    });
  }

  originChange(isAllOrigins) {
    if (isAllOrigins && !_.isEmpty(this.props.origins)) {
      const result = window.confirm('Are you sure? Switching to all origin domains will overwrite your specific origin domains.');
      if (!result) { return; }
    }
    this.props.saveCORS({
      corsEnabled: this.props.corsEnabled,
      origins: isAllOrigins ? ['*'] : [],
      node: this.props.node
    });
  }

  addOrigin(origin) {
    this.props.saveCORS({
      corsEnabled: this.props.corsEnabled,
      origins: this.props.origins.concat(origin),
      node: this.props.node
    });
  }

  updateOrigin(updatedOrigin, originalOrigin) {
    const newOrigins = this.props.origins.slice();
    const index = _.indexOf(newOrigins, originalOrigin);
    if (index === -1) { return; }
    newOrigins[index] = updatedOrigin;

    this.props.saveCORS({
      corsEnabled: this.props.corsEnabled,
      origins: newOrigins,
      node: this.props.node
    });
  }

  deleteOrigin() {
    const { corsEnabled, origins, node, domainToDelete } = this.props;
    const index = this.props.origins.indexOf(domainToDelete);
    if (index === -1) { return; }
    const newOrigins = [
      ...origins.slice(0, index),
      ...origins.slice(index + 1)
    ];

    this.props.saveCORS({
      corsEnabled: corsEnabled,
      origins: newOrigins,
      node: node
    });
  }

  render() {
    const isVisible = [this.props.corsEnabled, !this.props.isAllOrigins].every((elem) => elem === true);

    let originSettings = (
      <div id={this.props.corsEnabled ? 'collapsing-container' : ''}>
        <Origins
          corsEnabled={this.props.corsEnabled}
          originChange={this.originChange.bind(this)}
          isAllOrigins={this.props.isAllOrigins} />
        <OriginTable
          updateOrigin={this.updateOrigin.bind(this)}
          deleteOrigin={this.props.showDeleteDomainConfirmation}
          isVisible={isVisible}
          origins={this.props.origins} />
        <OriginInput
          addOrigin={this.addOrigin.bind(this)}
          isVisible={isVisible} />
      </div>
    );

    if (this.props.isLoading) {
      originSettings = (<LoadLines />);
    }
    const deleteMsg = <span>Are you sure you want to delete <code>{_.escape(this.props.domainToDelete)}</code>?</span>;

    return (
      <div className="cors-page flex-body">
        <header id="cors-header">
          <p>{app.i18n.en_US['cors-notice']}</p>
        </header>

        <form id="corsForm" onSubmit={this.save.bind(this)}>
          <div className="cors-enable">
            {this.props.corsEnabled ? 'CORS is currently enabled.' : 'CORS is currently disabled.'}
            <br />
            <button
              type="button"
              className="enable-disable btn btn-secondary"
              onClick={this.enableCorsChange.bind(this)}
              disabled={this.props.isLoading ? 'disabled' : null}
            >
              {this.props.corsEnabled ? 'Disable CORS' : 'Enable CORS'}
            </button>
          </div>
          {originSettings}
        </form>

        <ConfirmationModal
          title="Confirm Deletion"
          visible={this.props.deleteDomainModalVisible}
          text={deleteMsg}
          buttonClass="btn-danger"
          onClose={this.props.hideDeleteDomainConfirmation}
          onSubmit={this.deleteOrigin.bind(this)}
          successButtonLabel="Delete Domain" />
      </div>
    );
  }
}
