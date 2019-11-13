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
import ReactDOM from "react-dom";
import ReactSelect from "react-select";

export class ThrottledReactSelectAsync extends React.Component {
  constructor(props) {
    super(props);
    this.lastCall = undefined;
  }

  wrapThrottler(loadOptions) {
    if (!loadOptions) {
      return () => {};
    }
    return (id, callback) => {
      if (this.lastCall) {
        clearTimeout(this.lastCall);
      }
      this.lastCall = setTimeout(() => {
        loadOptions(id, callback);
      }, 400);
    };
  }

  render() {
    // wrapThrottler() must be called here to ensure a new
    // function is created when props.loadOptions is updated
    const throttledLoadOptions = this.wrapThrottler(
      this.props.loadOptions
    ).bind(this);
    const newProps = {
      ...this.props,
      loadOptions: throttledLoadOptions,
      onBlurResetsInput: false
    };
    return <ReactSelect.Async {...newProps} />;
  }
}
