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
import app from "../../app";

import React from "react";

const LoadNewsButton = ({ showNews, isChecked, toggleChange }) => {
  return (
    <div>
      <p>
        When you click this button, you are requesting content and sharing your IP address with <a href="https://blog.couchdb.org/">blog.couchdb.org</a> which is edited by the Apache CouchDB PMC and maintained by <a href="https://wordpress.com/">wordpress.com</a>.
      </p>
      <p>
        If you don’t want to share your IP address, do not click the button.
      </p>
      <button className="btn btn-primary" onClick={showNews}>Load News</button>
      <label className="news-checkbox">
        <input type="checkbox"
          checked={isChecked}
          onChange={toggleChange}
        />
        Remember my choice
      </label>
    </div>
  );
};

class NewsPage extends React.Component {
  constructor (props) {
    super(props);
    this.showNews = this.showNews.bind(this);
    this.toggleChange = this.toggleChange.bind(this);

    const hasCookie = !!app.utils.localStorageGet('allow-IP-sharing');

    this.state = {
      showNews: hasCookie ? true : false,
      hasCookie
    };
  }

  showNews() {
    this.setState({ showNews: true });
  }

  toggleChange() {
    const hasCookie = this.state.hasCookie;
    this.setState(() => ({ hasCookie: !hasCookie }));
    app.utils.localStorageSet('allow-IP-sharing', !hasCookie);
  }

  render() {
    const news = <iframe src="https://blog.couchdb.org" width="100%" height="100%"></iframe>;

    return (
      <div className="news-page">
        {this.state.showNews ?
          <LoadNewsButton
            showNews={this.showNews}
            toggleChange={this.toggleChange}
            isChecked={this.state.hasCookie}></LoadNewsButton>
          :
          news
        }
      </div>
    );
  }
}

export default {
  NewsPage: NewsPage
};
