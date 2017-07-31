import React, { Component } from "react";
import { validateOrigin } from "../helpers";
import Resources from "../resources";

export default class OriginInput extends Component {

  constructor (props) {
    super(props);
    this.state = {
      origin: ''
    };
  }

  onInputChange (e) {
    this.setState({origin: e.target.value});
  }

  addOrigin (event) {
    event.preventDefault();
    if (!validateOrigin(this.state.origin)) {
      return;
    }

    var url = Resources.normalizeUrls(this.state.origin);

    this.props.addOrigin(url);
    this.setState({origin: ''});
  }

  onKeyUp (e) {
    if (e.keyCode == 13) {   //enter key
      return this.addOrigin(e);
    }
  }

  render () {
    if (!this.props.isVisible) {
      return null;
    }

    return (
      <div id="origin-domains-container">
        <div className="origin-domains">
          <div className="input-append">
            <input type="text" name="new_origin_domain" onChange={this.onInputChange.bind(this)} onKeyUp={this.onKeyUp.bind(this) } value={this.state.origin} placeholder="https://example.com"/>
            <button onClick={ this.addOrigin.bind(this) } className="btn btn-secondary add-domain"><i className="icon fonticon-ok-circled"></i> Add Domain</button>
          </div>
        </div>
      </div>
    );
  }

};
