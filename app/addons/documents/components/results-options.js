
import React from 'react';
import PropTypes from 'prop-types';
import Components from '../../components/react-components';
import {ButtonToolbar, Dropdown, Glyphicon, MenuItem} from 'react-bootstrap';

const {ToggleHeaderButton, TrayContents} = Components;

export default class ResultsOptions extends React.Component {
  static defaultProps = {
    showPartitionedOption: false
  };

  static propTypes = {
    showPartitionedOption: PropTypes.bool.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      isPromptVisible: false
    };

    this.onTrayToggle = this.onTrayToggle.bind(this);
    this.closeTray = this.closeTray.bind(this);
  }

  onTrayToggle () {
    this.setState({isPromptVisible: !this.state.isPromptVisible});
  }

  closeTray () {
    this.setState({isPromptVisible: false});
  }

  render() {
    return (
      <div>
        {/* <ToggleHeaderButton
          selected={this.state.isPromptVisible}
          toggleCallback={this.onTrayToggle}
          // containerClasses='header-control-box add-new-database-btn'
          title="Display options"
          fonticon="fonticon-gears"
          text="" />
        <TrayContents className="new-database-tray" contentVisible={this.state.isPromptVisible} closeTray={this.closeTray}>
          <div className="add-on">Options</div>
          <input
            id="display-density-default"
            type="radio"
          />
          <input
            id="display-density-default"
            type="radio"
          />
        </TrayContents> */}
        
          <Dropdown id="dropdown-custom-1">
            <Dropdown.Toggle>
              <i className='fonticon-gears'></i>
            </Dropdown.Toggle>
            <Dropdown.Menu className="super-colors">
              <MenuItem header>Display density</MenuItem>
              <MenuItem eventKey="1" active>Fit values</MenuItem>
              <MenuItem eventKey="2">Expand values</MenuItem>
            </Dropdown.Menu>
          </Dropdown>
        
      </div>
    );
  }
}
