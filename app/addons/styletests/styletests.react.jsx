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
  "app",
  "api",
  'react'

], function (app, FauxtonAPI, React) {


  var StyleTests = React.createClass({

    render: function () {
      return (
        <div className="container theme-showcase">

          <div className="jumbotron">
            <h1>Fauxton Style Guide <small>mostly made of Bootstrap 2.x</small></h1>
            <p>(Mostly) Standard Bootstrap styles customized for Fauxton.</p>
          </div>

          <div className="page-header">
            <h1>Typography</h1>
          </div>
          <h1>h1. Heading 1</h1>
          <h2>h2. Heading 2</h2>
          <h3>h3. Heading 3</h3>
          <h4>h4. Heading 4</h4>
          <h5>h5. Heading 5</h5>
          <h6>h6. Heading 6</h6>

          <div className="page-header">
            <h1>Buttons</h1>
          </div>

          <h4>Bootstrap Standard Button className names</h4>
          <p>.btn.btn-large.btn-*<br />
            <button type="button" className="btn btn-large btn-default">Default</button>
            <button type="button" className="btn btn-large btn-primary">Primary</button>
            <button type="button" className="btn btn-large btn-success">Success</button>
            <button type="button" className="btn btn-large btn-info">Info</button>
            <button type="button" className="btn btn-large btn-warning">Warning</button>
            <button type="button" className="btn btn-large btn-danger">Danger</button>
            <button type="button" className="btn btn-large btn-link">Link</button>
          </p>
          <p>.btn.btn-*<br />
            <button type="button" className="btn btn-default">Default</button>
            <button type="button" className="btn btn-primary">Primary</button>
            <button type="button" className="btn btn-success">Success</button>
            <button type="button" className="btn btn-info">Info</button>
            <button type="button" className="btn btn-warning">Warning</button>
            <button type="button" className="btn btn-danger">Danger</button>
            <button type="button" className="btn btn-link">Link</button>
          </p>
          <p>.btn.btn-small.btn-*<br />
            <button type="button" className="btn btn-small btn-default">Default</button>
            <button type="button" className="btn btn-small btn-primary">Primary</button>
            <button type="button" className="btn btn-small btn-success">Success</button>
            <button type="button" className="btn btn-small btn-info">Info</button>
            <button type="button" className="btn btn-small btn-warning">Warning</button>
            <button type="button" className="btn btn-small btn-danger">Danger</button>
            <button type="button" className="btn btn-small btn-link">Link</button>
          </p>
          <p>.btn.btn-mini.btn-*<br />
            <button type="button" className="btn btn-mini btn-default">Default</button>
            <button type="button" className="btn btn-mini btn-primary">Primary</button>
            <button type="button" className="btn btn-mini btn-success">Success</button>
            <button type="button" className="btn btn-mini btn-info">Info</button>
            <button type="button" className="btn btn-mini btn-warning">Warning</button>
            <button type="button" className="btn btn-mini btn-danger">Danger</button>
            <button type="button" className="btn btn-mini btn-link">Link</button>
          </p>

          <h4>with Icons</h4>
          <p>.btn.btn-large.btn-*<br />
            <button type="button" className="btn btn-large btn-default"><i className="icon fonticon-new-database"></i> Default</button>
            <button type="button" className="btn btn-large btn-primary"><i className="icon fonticon-new-database"></i> Primary</button>
            <button type="button" className="btn btn-large btn-success"><i className="icon fonticon-new-database"></i> Success</button>
            <button type="button" className="btn btn-large btn-info"><i className="icon fonticon-new-database"></i> Info</button>
            <button type="button" className="btn btn-large btn-warning"><i className="icon fonticon-new-database"></i> Warning</button>
            <button type="button" className="btn btn-large btn-danger"><i className="icon fonticon-new-database"></i> Danger</button>
            <button type="button" className="btn btn-large btn-link"><i className="icon fonticon-new-database"></i> Link</button>
          </p>

          <p>.btn.btn-*<br />
            <button type="button" className="btn btn-default"><i className="icon fonticon-new-database"></i> Default</button>
            <button type="button" className="btn btn-primary"><i className="icon fonticon-new-database"></i> Primary</button>
            <button type="button" className="btn btn-success"><i className="icon fonticon-new-database"></i> Success</button>
            <button type="button" className="btn btn-info"><i className="icon fonticon-new-database"></i> Info</button>
            <button type="button" className="btn btn-warning"><i className="icon fonticon-new-database"></i> Warning</button>
            <button type="button" className="btn btn-danger"><i className="icon fonticon-new-database"></i> Danger</button>
            <button type="button" className="btn btn-link"><i className="icon fonticon-new-database"></i> Link</button>
          </p>
          <p>.btn.btn-small.btn-*<br />
            <button type="button" className="btn btn-small btn-default"><i className="icon fonticon-new-database"></i> Default</button>
            <button type="button" className="btn btn-small btn-primary"><i className="icon fonticon-new-database"></i> Primary</button>
            <button type="button" className="btn btn-small btn-success"><i className="icon fonticon-new-database"></i> Success</button>
            <button type="button" className="btn btn-small btn-info"><i className="icon fonticon-new-database"></i> Info</button>
            <button type="button" className="btn btn-small btn-warning"><i className="icon fonticon-new-database"></i> Warning</button>
            <button type="button" className="btn btn-small btn-danger"><i className="icon fonticon-new-database"></i> Danger</button>
            <button type="button" className="btn btn-small btn-link"><i className="icon fonticon-new-database"></i> Link</button>
          </p>
          <p>.btn.btn-mini.btn-*<br />
            <button type="button" className="btn btn-mini btn-default"><i className="icon fonticon-new-database"></i> Default</button>
            <button type="button" className="btn btn-mini btn-primary"><i className="icon fonticon-new-database"></i> Primary</button>
            <button type="button" className="btn btn-mini btn-success"><i className="icon fonticon-new-database"></i> Success</button>
            <button type="button" className="btn btn-mini btn-info"><i className="icon fonticon-new-database"></i> Info</button>
            <button type="button" className="btn btn-mini btn-warning"><i className="icon fonticon-new-database"></i> Warning</button>
            <button type="button" className="btn btn-mini btn-danger"><i className="icon fonticon-new-database"></i> Danger</button>
            <button type="button" className="btn btn-mini btn-link"><i className="icon fonticon-new-database"></i> Link</button>
          </p>

          <h4>just Icons</h4>
          <p>.btn.btn-large.btn-*<br />
            <button type="button" className="btn btn-large btn-default"><i className="icon fonticon-new-database"></i></button>
            <button type="button" className="btn btn-large btn-primary"><i className="icon fonticon-new-database"></i></button>
            <button type="button" className="btn btn-large btn-success"><i className="icon fonticon-new-database"></i></button>
            <button type="button" className="btn btn-large btn-info"><i className="icon fonticon-new-database"></i></button>
            <button type="button" className="btn btn-large btn-warning"><i className="icon fonticon-new-database"></i></button>
            <button type="button" className="btn btn-large btn-danger"><i className="icon fonticon-new-database"></i></button>
            <button type="button" className="btn btn-large btn-link"><i className="icon fonticon-new-database"></i></button>
          </p>

          <p>.btn.btn-*<br />
            <button type="button" className="btn btn-default"><i className="icon fonticon-new-database"></i></button>
            <button type="button" className="btn btn-primary"><i className="icon fonticon-new-database"></i></button>
            <button type="button" className="btn btn-success"><i className="icon fonticon-new-database"></i></button>
            <button type="button" className="btn btn-info"><i className="icon fonticon-new-database"></i></button>
            <button type="button" className="btn btn-warning"><i className="icon fonticon-new-database"></i></button>
            <button type="button" className="btn btn-danger"><i className="icon fonticon-new-database"></i></button>
            <button type="button" className="btn btn-link"><i className="icon fonticon-new-database"></i></button>
          </p>
          <p>.btn.btn-small.btn-*<br />
            <button type="button" className="btn btn-small btn-default"><i className="icon fonticon-new-database"></i></button>
            <button type="button" className="btn btn-small btn-primary"><i className="icon fonticon-new-database"></i></button>
            <button type="button" className="btn btn-small btn-success"><i className="icon fonticon-new-database"></i></button>
            <button type="button" className="btn btn-small btn-info"><i className="icon fonticon-new-database"></i></button>
            <button type="button" className="btn btn-small btn-warning"><i className="icon fonticon-new-database"></i></button>
            <button type="button" className="btn btn-small btn-danger"><i className="icon fonticon-new-database"></i></button>
            <button type="button" className="btn btn-small btn-link"><i className="icon fonticon-new-database"></i></button>
          </p>
          <p>.btn.btn-mini.btn-*<br />
            <button type="button" className="btn btn-mini btn-default"><i className="icon fonticon-new-database"></i></button>
            <button type="button" className="btn btn-mini btn-primary"><i className="icon fonticon-new-database"></i></button>
            <button type="button" className="btn btn-mini btn-success"><i className="icon fonticon-new-database"></i></button>
            <button type="button" className="btn btn-mini btn-info"><i className="icon fonticon-new-database"></i></button>
            <button type="button" className="btn btn-mini btn-warning"><i className="icon fonticon-new-database"></i></button>
            <button type="button" className="btn btn-mini btn-danger"><i className="icon fonticon-new-database"></i></button>
            <button type="button" className="btn btn-mini btn-link"><i className="icon fonticon-new-database"></i></button>
          </p>
          <p>.btn-group<br />
            <div className="btn-group">
              <a href="#" className="btn btn-small edits">Edit design doc</a>
              <button href="#" className="btn btn-small btn-danger delete" title="Delete this document."><i className="icon icon-trash"></i></button>
            </div>
          </p>

          <h4>disabled</h4>
          <p>.btn.btn-*<br />
            <button type="button" disabled="disabled" className="btn btn-default"><i className="icon fonticon-new-database"></i> Default</button>
            <button type="button" disabled="disabled" className="btn btn-primary"><i className="icon fonticon-new-database"></i> Primary</button>
            <button type="button" disabled="disabled" className="btn btn-success"><i className="icon fonticon-new-database"></i> Success</button>
            <button type="button" disabled="disabled" className="btn btn-info"><i className="icon fonticon-new-database"></i> Info</button>
            <button type="button" disabled="disabled" className="btn btn-warning"><i className="icon fonticon-new-database"></i> Warning</button>
            <button type="button" disabled="disabled" className="btn btn-danger"><i className="icon fonticon-new-database"></i> Danger</button>
            <button type="button" disabled="disabled" className="btn btn-link"><i className="icon fonticon-new-database"></i> Link</button>
          </p>
          <p>.btn.btn-*<br />
            <button type="button" disabled="disabled" className="btn btn-default">Default</button>
            <button type="button" disabled="disabled" className="btn btn-primary">Primary</button>
            <button type="button" disabled="disabled" className="btn btn-success">Success</button>
            <button type="button" disabled="disabled" className="btn btn-info">Info</button>
            <button type="button" disabled="disabled" className="btn btn-warning">Warning</button>
            <button type="button" disabled="disabled" className="btn btn-danger">Danger</button>
            <button type="button" disabled="disabled" className="btn btn-link">Link</button>
          </p>

          <div className="page-header">
            <h1>Forms</h1>
          </div>

          <form className="navbar-form database-search">
            <div className="input-append">
              <input className="search-autocomplete" name="search-query" autoComplete="off" placeholder="Database name" type="text" />
              <button className="btn btn-primary" type="submit"><i className="icon icon-search"></i></button>
            </div>
          </form>

          <form className="navbar-form database-search">
            <div className="input-append">
              <input className="search-autocomplete" name="search-query" autoComplete="off" placeholder="Database name" type="text" />
              <button className="btn btn-primary" type="submit"><i className="icon icon-search"></i> Search</button>
            </div>
          </form>

          <form className="navbar-form">
            <div className="input-append">
              <input name="search-query" placeholder="Database name" type="text" />
              <button className="btn btn-primary" type="submit">Search</button>
            </div>
          </form>

          <form>
            <fieldset>
              <legend>Legend</legend>
              <label>Label name</label>
              <input type="text" placeholder="Type something…" />
              <span className="help-block">Example block-level help text here.</span>
              <label className="checkbox">
                <input type="checkbox" /> Check me out
              </label>
              <button type="submit" className="btn">Submit</button>
            </fieldset>
          </form>

          <p>Search</p>
          <form className="form-search">
            <input type="text" className="input-medium search-query" />
            <button type="submit" className="btn">Search</button>
          </form>

          <p>Sign in</p>
          <form className="form-inline">
            <input type="text" className="input-small" placeholder="Email" />
            <input type="password" className="input-small" placeholder="Password" />
            <label className="checkbox">
              <input type="checkbox" /> Remember me
            </label>
            <button type="submit" className="btn">Sign in</button>
          </form>

          <p>Whole form</p>
          <form className="form-horizontal">
          <div className="control-group">
            <label className="control-label" htmlFor="inputEmail">Email</label>
            <div className="controls">
              <input type="text" id="inputEmail" placeholder="Email" />
            </div>
          </div>
          <div className="control-group">
            <label className="control-label" htmlFor="inputPassword">Password</label>
            <div className="controls">
              <input type="password" id="inputPassword" placeholder="Password" />
            </div>
          </div>
          <div className="control-group">
            <div className="controls">
              <label className="checkbox">
                <input type="checkbox" /> Remember me
              </label>
              <button type="submit" className="btn">Sign in</button>
            </div>
          </div>
          </form>

          <p>Selects</p>
          <select>
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
          </select>

          <select multiple="multiple">
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
          </select>

          <p>Inputs with pre</p>
          <div className="input-prepend">
            <span className="add-on">@</span>
            <input className="span2" id="prependedInput" type="text" placeholder="Username" />
          </div>
          <p>Inputs with post</p>
          <div className="input-append">
            <input className="span2" id="appendedInput" type="text" />
            <span className="add-on">.00</span>
          </div>
          <p>Inputs with pre and post</p>
          <div className="input-prepend input-append">
            <span className="add-on">$</span>
            <input className="span2" id="appendedPrependedInput" type="text" />
            <span className="add-on">.00</span>
          </div>
          <p>Inputs with button</p>
        <div className="input-append">
          <input className="span2" id="appendedInputButton" type="text" />
          <button className="btn" type="button">Go!</button>
        </div>
          <p>Inputs with two buttons</p>
        <div className="input-append">
          <input className="span2" id="appendedInputButtons" type="text" />
          <button className="btn" type="button">Search</button>
          <button className="btn" type="button">Options</button>
        </div>
        <p>Inputs with dropdown button</p>
        <div className="input-append">
          <input className="span2" id="appendedDropdownButton" type="text" />
          <div className="btn-group">
            <button className="btn dropdown-toggle" data-toggle="dropdown">
              Action
              <span className="caret"></span>
            </button>
            <ul className="dropdown-menu">
              ...
            </ul>
          </div>
        </div>
        <p>Inputs sizes</p>
        <input className="input-mini" type="text" placeholder=".input-mini" />
        <input className="input-small" type="text" placeholder=".input-small" />
        <input className="input-medium" type="text" placeholder=".input-medium" />
        <input className="input-large" type="text" placeholder=".input-large" />
        <input className="input-xlarge" type="text" placeholder=".input-xlarge" />
        <input className="input-xxlarge" type="text" placeholder=".input-xxlarge" />


          <div className="page-header">
            <h1>Thumbnails</h1>
          </div>
        <img src="dashboard.assets/img/ripley.jpeg" className="img-rounded" />
        <img src="dashboard.assets/img/ripley.jpeg" className="img-circle" />
        <img src="dashboard.assets/img/ripley.jpeg" className="img-polaroid" />


          <div className="page-header">
            <h1>Dropdown menus</h1>
          </div>
          <div className="dropdown theme-dropdown clearfix">
            <a id="dropdownMenu1" href="#" role="button" className="sr-only dropdown-toggle" data-toggle="dropdown">Dropdown <b className="caret"></b></a>
            <ul className="dropdown-menu" role="menu" aria-labelledby="dropdownMenu1">
              <li role="presentation"><a role="menuitem" tabIndex="-1" href="#">Action</a></li>
              <li role="presentation"><a role="menuitem" tabIndex="-1" href="#">Another action</a></li>
              <li role="presentation"><a role="menuitem" tabIndex="-1" href="#">Something else here</a></li>
              <li role="presentation" className="divider"></li>
              <li role="presentation"><a role="menuitem" tabIndex="-1" href="#">Separated link</a></li>
            </ul>
          </div>




          <div className="page-header">
            <h1>Navbars</h1>
          </div>

          <div className="navbar navbar-default">
            <div className="container">
              <div className="navbar-header">
                <button type="button" className="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
                  <span className="icon-bar"></span>
                  <span className="icon-bar"></span>
                  <span className="icon-bar"></span>
                </button>
                <a className="navbar-brand" href="#">Project name</a>
              </div>
              <div className="navbar-collapse collapse">
                <ul className="nav navbar-nav">
                  <li className="active"><a href="#">Home</a></li>
                  <li><a href="#about">About</a></li>
                  <li><a href="#contact">Contact</a></li>
                </ul>
                <ul className="nav navbar-nav navbar-right">
                  <li><a href="../navbar/">Default</a></li>
                  <li><a href="../navbar-static-top/">Static top</a></li>
                  <li className="active"><a href="./">Fixed top</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="navbar navbar-inverse">
            <div className="container">
              <div className="navbar-header">
                <button type="button" className="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
                  <span className="icon-bar"></span>
                  <span className="icon-bar"></span>
                  <span className="icon-bar"></span>
                </button>
                <a className="navbar-brand" href="#">Project name</a>
              </div>
              <div className="navbar-collapse collapse">
                <ul className="nav navbar-nav">
                  <li className="active"><a href="#">Home</a></li>
                  <li><a href="#about">About</a></li>
                  <li><a href="#contact">Contact</a></li>
                </ul>
                <ul className="nav navbar-nav navbar-right">
                  <li><a href="../navbar/">Default</a></li>
                  <li><a href="../navbar-static-top/">Static top</a></li>
                  <li className="active"><a href="./">Fixed top</a></li>
                </ul>
              </div>
            </div>
          </div>



          <div className="page-header">
            <h1>Alerts</h1>
          </div>
          <div className="alert alert-success">
            <strong>Well done!</strong> You successfully read this important alert message.
          </div>
          <div className="alert alert-info">
            <strong>Heads up!</strong> This alert needs your attention, but it's not super important.
          </div>
          <div className="alert alert-warning">
            <strong>Warning!</strong> Best check yo self, you're not looking too good.
          </div>
          <div className="alert alert-danger">
            <strong>Oh snap!</strong> Change a few things up and try submitting again.
          </div>



          <div className="page-header">
            <h1>Progresss</h1>
          </div>
          <div className="progress">
            <div className="bar" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" style={{width: '60%'}}><span className="sr-only">60% Complete</span></div>
          </div>
          <div className="progress">
            <div className="bar bar-success" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style={{width: '40%'}}><span className="sr-only">40% Complete (success)</span></div>
          </div>
          <div className="progress">
            <div className="bar bar-info" role="progressbar" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100" style={{width: '20%'}}><span className="sr-only">20% Complete</span></div>
          </div>
          <div className="progress">
            <div className="bar bar-warning" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" style={{width: '60%'}}><span className="sr-only">60% Complete (warning)</span></div>
          </div>
          <div className="progress">
            <div className="bar bar-danger" role="progressbar" aria-valuenow="80" aria-valuemin="0" aria-valuemax="100" style={{width: '80%'}}><span className="sr-only">80% Complete (danger)</span></div>
          </div>
          <div className="progress">
            <div className="bar bar-success" style={{width: '35%'}}><span className="sr-only">35% Complete (success)</span></div>
            <div className="bar bar-warning" style={{width: '20%'}}><span className="sr-only">20% Complete (warning)</span></div>
            <div className="bar bar-danger" style={{width: '10%'}}><span className='sr-only'>10% Complete (danger)</span></div>
          </div>



          <div className="page-header">
            <h1>List groups</h1>
          </div>
          <div className="row">
            <div className="col-sm-4">
              <ul className="nav nav-tabs nav-stacked">
                <li className="list-group-item">Cras justo odio</li>
                <li className="list-group-item">Dapibus ac facilisis in</li>
                <li className="list-group-item">Morbi leo risus</li>
                <li className="list-group-item">Porta ac consectetur ac</li>
                <li className="list-group-item">Vestibulum at eros</li>
              </ul>
            </div>
            <div className="col-sm-4">
              <div className="nav nav-tabs nav-stacked">
                <a href="#" className="list-group-item active">
                  Cras justo odio
                </a>
                <a href="#" className="list-group-item">Dapibus ac facilisis in</a>
                <a href="#" className="list-group-item">Morbi leo risus</a>
                <a href="#" className="list-group-item">Porta ac consectetur ac</a>
                <a href="#" className="list-group-item">Vestibulum at eros</a>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="nav nav-tabs nav-stacked">
                <a href="#" className="list-group-item active">
                  <h4 className="list-group-item-heading">List group item heading</h4>
                  <p className="list-group-item-text">Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius blandit.</p>
                </a>
                <a href="#" className="list-group-item">
                  <h4 className="list-group-item-heading">List group item heading</h4>
                  <p className="list-group-item-text">Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius blandit.</p>
                </a>
                <a href="#" className="list-group-item">
                  <h4 className="list-group-item-heading">List group item heading</h4>
                  <p className="list-group-item-text">Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius blandit.</p>
                </a>
              </div>
            </div>
          </div>

          <div className="page-header">
            <h1>Wells</h1>
          </div>
          <div className="well">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas sed diam eget risus varius blandit sit amet non magna. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cras mattis consectetur purus sit amet fermentum. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Aenean lacinia bibendum nulla sed consectetur.</p>
          </div>


        </div>
      );
    }

  });

  return {
    StyleTests: StyleTests
  };

});
