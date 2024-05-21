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

const DocumentationItem = ({iconClassName, link, title}) => {
  return <div className="col-12 col-sm-6 col-lg-4 mb-4">
    <div className={'logo ' + iconClassName}>
      <a href={link} target="_blank" rel="noopener noreferrer" data-bypass="true">{title}</a>
    </div>
  </div>;
};

const DocumentationPage = () => {
  return (
    <div id="documentation-page" className="scrollable">
      <div className="links row mb-4">
        <DocumentationItem
          iconClassName='couchdb-icon'
          link='https://docs.couchdb.org/en/latest/'
          title='CouchDB Official Documentation — Online' />
        <DocumentationItem
          iconClassName='couchdb-icon'
          link='./docs/index.html'
          title='CouchDB Official Documentation — Offline' />
        <DocumentationItem
          iconClassName='couchdb-icon'
          link='https://blog.couchdb.org/'
          title='CouchDB Weekly News' />
        <DocumentationItem
          iconClassName='couchdb-icon'
          link='https://couchdb.apache.org/'
          title='CouchDB Homepage' />
        <DocumentationItem
          iconClassName='couchdb-icon'
          link='https://couchdb.apache.org/fauxton-visual-guide/index.html'
          title='Fauxton Visual Guide' />
      </div>
      <div className="links row mb-4">
        <DocumentationItem
          iconClassName='github-icon'
          link='https://github.com/apache/couchdb'
          title='CouchDB on GitHub' />
        <DocumentationItem
          iconClassName='github-icon'
          link='https://github.com/apache/couchdb-fauxton'
          title='Fauxton on GitHub' />
      </div>

      <div className="links row mb-4">
        <DocumentationItem
          iconClassName='asf-feather-icon'
          link='https://www.apache.org/'
          title='The Apache Software Foundation' />
        <DocumentationItem
          iconClassName='mastodon-icon'
          link='https://fosstodon.org/@couchdb'
          title='Follow CouchDB on Mastodon' />
        <DocumentationItem
          iconClassName='linkedin-icon'
          link='https://www.linkedin.com/company/apache-couchdb'
          title='Follow CouchDB on LinkedIn' />
      </div>
    </div>
  );
};

export default {
  DocumentationPage: DocumentationPage
};
