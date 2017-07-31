import React, { Component } from "react";
import Actions from "../actions";
import Stores from "../stores";
import app from "../../../app";
import ReactComponents from "../../components/react-components";
import FauxtonComponents from "../../fauxton/components";
import Origins from "./Origins";
import OriginInput from "./OriginInput";
import OriginTable from "./OriginTable";

const LoadLines = ReactComponents.LoadLines;
const ConfirmationModal = FauxtonComponents.ConfirmationModal;
const corsStore = Stores.corsStore;

export default class CORSController extends Component {

  constructor (props) {
    super(props);
    this.state = this.getStoreState();
  }

  getStoreState () {
    return {
      corsEnabled: corsStore.isEnabled(),
      origins: corsStore.getOrigins(),
      isAllOrigins: corsStore.isAllOrigins(),
      configChanged: corsStore.hasConfigChanged(),
      shouldSaveChange: corsStore.shouldSaveChange(),
      node: corsStore.getNode(),
      isLoading: corsStore.getIsLoading(),
      deleteDomainModalVisible: corsStore.isDeleteDomainModalVisible(),
      domainToDelete: corsStore.getDomainToDelete()
    };
  }

  componentDidMount () {
    corsStore.on('change', this.onChange, this);
  }

  componentWillUnmount () {
    corsStore.off('change', this.onChange);
  }

  componentDidUpdate () {
    if (this.state.shouldSaveChange) {
      this.save();
    }
  }

  onChange () {
    this.setState(this.getStoreState());
  }

  enableCorsChange () {
    if (this.state.corsEnabled && !_.isEmpty(this.state.origins)) {
      var result = window.confirm(app.i18n.en_US['cors-disable-cors-prompt']);
      if (!result) { return; }
    }

    Actions.toggleEnableCors();
  }

  save () {
    Actions.saveCors({
      enableCors: this.state.corsEnabled,
      origins: this.state.origins,
      node: this.state.node
    });
  }

  originChange (isAllOrigins) {
    if (isAllOrigins && !_.isEmpty(this.state.origins)) {
      var result = window.confirm('Are you sure? Switching to all origin domains will overwrite your specific origin domains.');
      if (!result) { return; }
    }

    Actions.originChange(isAllOrigins);
  }

  addOrigin (origin) {
    Actions.addOrigin(origin);
  }

  updateOrigin (updatedOrigin, originalOrigin) {
    Actions.updateOrigin(updatedOrigin, originalOrigin);
  }

  methodChange (httpMethod) {
    Actions.methodChange(httpMethod);
  }

  deleteOrigin () {
    Actions.deleteOrigin(this.state.domainToDelete);
  }

  render () {
    var isVisible = _.all([this.state.corsEnabled, !this.state.isAllOrigins]);

    var originSettings = (
      <div id={this.state.corsEnabled ? 'collapsing-container' : ''}>
        <Origins corsEnabled={this.state.corsEnabled} originChange={ this.originChange.bind(this) } isAllOrigins={this.state.isAllOrigins}/>
        <OriginTable updateOrigin={ this.updateOrigin.bind(this) } isVisible={isVisible} origins={this.state.origins} />
        <OriginInput addOrigin={ this.addOrigin.bind(this) } isVisible={isVisible} />
      </div>
    );

    if (this.state.isLoading) {
      originSettings = (<LoadLines />);
    }
    var deleteMsg = <span>Are you sure you want to delete <code>{_.escape(this.state.domainToDelete)}</code>?</span>;

    return (
      <div className="cors-page flex-body">
        <header id="cors-header">
          <p>{app.i18n.en_US['cors-notice']}</p>
        </header>

        <form id="corsForm" onSubmit={ this.save.bind(this) }>
          <div className="cors-enable">
            {this.state.corsEnabled ? 'Cors is currently enabled.' : 'Cors is currently disabled.'}
            <br />
            <button
              type="button"
              className="enable-disable btn btn-secondary"
              onClick={ this.enableCorsChange.bind(this) }
              disabled={this.state.isLoading ? 'disabled' : null}
            >
              {this.state.corsEnabled ? 'Disable CORS' : 'Enable CORS'}
            </button>
          </div>
          {originSettings}
        </form>

        <ConfirmationModal
          title="Confirm Deletion"
          visible={this.state.deleteDomainModalVisible}
          text={deleteMsg}
          buttonClass="btn-danger"
          onClose={Actions.hideDeleteDomainModal}
          onSubmit={ this.deleteOrigin.bind(this) }
          successButtonLabel="Delete Domain" />
      </div>
    );
  }
};
