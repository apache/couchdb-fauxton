

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

import PropTypes from 'prop-types';
import React from "react";
import { Button, Modal } from "react-bootstrap";
import FauxtonAPI from "../../core/api";


// formats a block of code and pretty-prints it in the page. Currently uses the prettyPrint plugin
class CodeFormat extends React.Component {
  static defaultProps = {
    lang: "js"
  };

  getClasses = () => {
    // added for forward compatibility. This component defines an api via it's props so you can pass lang="N" and
    // not the class that prettyprint requires for that lang. If (when, hopefully!) we drop prettyprint we won't
    // have any change this component's props API and break things
    var classMap = {
      js: 'lang-js'
    };

    var classNames = 'prettyprint';
    if (_.has(classMap, this.props.lang)) {
      classNames += ' ' + classMap[this.props.lang];
    }
    return classNames;
  };

  componentDidMount() {
    // this one function is all the lib offers. It parses the entire page and pretty-prints anything with
    // a .prettyprint class; only executes on an element once
    prettyPrint();
  }

  render() {
    const code = JSON.stringify(this.props.code, null, " ");
    return (
      <div><pre className={this.getClasses()}>{code}</pre></div>
    );
  }
}

class Pagination extends React.Component {
  static defaultProps = {
    perPage: FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE,
    onClick: null,
    page: 1,
    total: 0,
    urlPrefix: '',
    urlSuffix: '',
    maxNavPages: 10
  };

  getVisiblePages = (page, totalPages) => {
    var from, to;
    if (totalPages < this.props.maxNavPages) {
      from = 1;
      to = totalPages + 1;
    } else {
      var halfMaxNavPages = Math.floor(this.props.maxNavPages / 2);
      from = page - halfMaxNavPages;
      to = page + halfMaxNavPages;
      if (from <= 1) {
        from = 1;
        to = this.props.maxNavPages + 1;
      }
      if (to > totalPages + 1) {
        from = totalPages - (this.props.maxNavPages - 1);
        to = totalPages + 1;
      }
    }
    return {
      from: from,
      to: to
    };
  };

  createItemsForPage = (visiblePages) => {
    return _.range(visiblePages.from, visiblePages.to).map((i) => {
      return (
        <li key={i} className={'page-item ' + (this.props.page === i ? 'active' : '')}>
          {this.getLink(i, i)}
        </li>
      );
    });
  };

  getOnPageClick(pageNumber) {
    return (e) => {
      if (e) {
        e.preventDefault();
      }
      this.props.onClick(pageNumber);
    };
  }

  getLink = (i, label, fontIcon) => {
    const linkClass = fontIcon ? `page-link ${fontIcon}` : 'page-link';
    if (this.props.onClick) {
      return (
        <a className={linkClass} onClick={this.getOnPageClick(i)}>{label}</a>
      );
    }
    return (
      <a className={linkClass} href={this.props.urlPrefix + i + this.props.urlSuffix}>{label}</a>
    );
  };

  getTotalPages = () => {
    return this.props.total === 0 ? 1 : Math.ceil(this.props.total / this.props.perPage);
  };

  render() {
    var totalPages = this.getTotalPages();
    var visiblePages = this.getVisiblePages(this.props.page, totalPages);
    var rangeItems = this.createItemsForPage(visiblePages);
    var prevPage = Math.max(this.props.page - 1, 1);
    var nextPage = Math.min(this.props.page + 1, totalPages);

    return (
      <ul className="pagination">
        <li className={'page-item ' + (this.props.page === 1 ? "disabled" : '')}>
          {this.getLink(prevPage, '', 'fonticon-left-open')}
        </li>
        {rangeItems}
        <li className={'page-item ' + (this.props.page < totalPages ? '' : "disabled")}>
          {this.getLink(nextPage, '', 'fonticon-right-open')}
        </li>
      </ul>
    );
  }
}

// a super-simple replacement for window.confirm()
class ConfirmationModal extends React.Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    text: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.element
    ]).isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired
  };

  static defaultProps = {
    visible: false,
    title: 'Confirmation',
    text: '',
    successButtonLabel: 'Ok',
    buttonVariant: 'cf-primary'
  };

  close = (e) => {
    if (e) {
      e.preventDefault();
    }
    this.props.onClose();
  };

  render() {
    let content = <p>{this.props.text}</p>;
    if (!_.isString(this.props.text)) {
      content = this.props.text;
    }
    const closeButton = this.props.onClose ? (
      <Button href="#" data-bypass="true" variant="cf-cancel" className="cancel-link" onClick={this.close}>Cancel</Button>
    ) : null;
    const submitButton = this.props.onSubmit ? (
      <Button variant={this.props.buttonVariant} onClick={this.props.onSubmit}>
        <i className="fonticon-ok-circled"></i> {this.props.successButtonLabel}
      </Button>
    ) : null;
    return (
      <Modal dialogClassName="confirmation-modal" show={this.props.visible} onHide={this.close}>
        <Modal.Header closeButton={true}>
          <Modal.Title>{this.props.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {content}
        </Modal.Body>
        <Modal.Footer>
          { closeButton }
          { submitButton }
        </Modal.Footer>
      </Modal>
    );
  }
}


export default {
  CodeFormat: CodeFormat,
  Pagination: Pagination,
  ConfirmationModal: ConfirmationModal
};
