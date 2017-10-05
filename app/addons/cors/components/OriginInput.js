import PropTypes from 'prop-types';
import React, { Component } from "react";
import { validateDomain, normalizeUrls } from "../helpers";

export default class OriginInput extends Component {

  constructor(props) {
    super(props);
    this.state = {
      origin: ''
    };
  }

  onInputChange(e) {
    this.setState({ origin: e.target.value });
  }

  addOrigin(event) {
    event.preventDefault();
    if (!validateDomain(this.state.origin)) {
      return false;
    }

    const url = normalizeUrls(this.state.origin);

    this.props.addOrigin(url);
    this.setState({ origin: '' });
  }

  onKeyUp(e) {
    if (e.keyCode == 13) {   //enter key
      return this.addOrigin(e);
    }
  }

  render() {
    if (!this.props.isVisible) {
      return null;
    }

    return (
      <div id="origin-domains-container">
        <div className="origin-domains">
          <div className="input-append">
            <input type="text" name="new_origin_domain" placeholder="https://example.com"
              onChange={this.onInputChange.bind(this)} value={this.state.origin} />
            <button onClick={this.addOrigin.bind(this)} className="btn btn-secondary add-domain">
              <i className="icon fonticon-ok-circled"></i> Add Domain
            </button>
          </div>
        </div>
      </div>
    );
  }

}

OriginInput.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  addOrigin: PropTypes.func.isRequired
};
