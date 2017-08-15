import React, { Component } from "react";

export default class ExplainPage extends Component {
  componentDidMount () {
    prettyPrint();
  };

  componentDidUpdate () {
    prettyPrint();
  };

  render () {
    return (
      <div>
        <pre className="prettyprint">{JSON.stringify(this.props.explainPlan, null, ' ')}</pre>
      </div>
    );
  };
}

ExplainPage.propTypes = {
  explainPlan: React.PropTypes.object.isRequired
};
