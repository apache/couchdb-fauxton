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

import React from "react";

const docLinks = [
  {
    title: 'CouchDB Official Documentation — Online',
    link: 'http://docs.couchdb.org/en/latest/',
    iconClassName: 'couchdb-icon'
  },
  {
    title: 'CouchDB Official Documentation — Offline',
    link: './docs/index.html',
    iconClassName: 'couchdb-icon'
  },
  {
    title: 'CouchDB Weekly News',
    link: 'http://blog.couchdb.org/',
    iconClassName: 'couchdb-icon'
  },
  {
    title: 'CouchDB Homepage',
    link: 'https://couchdb.apache.org/',
    iconClassName: 'couchdb-icon'
  },
  {
    title: 'CouchDB on GitHub',
    link: 'https://github.com/apache/couchdb',
    iconClassName: 'github-icon'
  },
  {
    title: 'Fauxton on GitHub',
    link: 'https://github.com/apache/couchdb-fauxton',
    iconClassName: 'github-icon'
  },
  {
    title: 'Fauxton Visual Guide',
    link: 'https://couchdb.apache.org/fauxton-visual-guide/index.html',
    iconClassName: 'couchdb-icon'
  },
  {
    title: 'The Apache Software Foundation',
    link: 'http://www.apache.org/',
    iconClassName: 'asf-feather-icon'
  },
  {
    title: 'Follow CouchDB on Twitter',
    link: 'https://twitter.com/couchdb',
    iconClassName: 'twitter-icon'
  },
  {
    title: 'Follow CouchDB on LinkedIn',
    link: 'https://www.linkedin.com/company/apache-couchdb',
    iconClassName: 'linkedin-icon'
  }
];

const DocumentationPage = ({links = docLinks}) => {

  function createLinkRows (linkList) {
    return linkList.map(function (linkObject) {
      return (
        <tr key={linkObject.title}>
          <td className="icons-container">
            <div className={"icon " + linkObject.iconClassName}> </div>
          </td>
          <td>
            <a href={linkObject.link} target="_blank" rel="noopener noreferrer" data-bypass="true">{linkObject.title}</a>
          </td>
        </tr>
      );
    });
  }

  return (
    <div id="documentation-page" className="scrollable">
      <div className="links">
        <table>
          <tbody>
            {createLinkRows(links)}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default {
  DocumentationPage: DocumentationPage
};
