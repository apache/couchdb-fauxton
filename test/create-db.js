const { axiosRequest } = require("./nightwatch_tests/custom-commands/helper");
const async = require("async");

module.exports = class CreateDbs {
  #url;
  constructor(url) {
    this.url = url;
  }

  tap = (f) => {
    f();
    return this;
  };

  #createRequest = (dbName) => {
    return (cb = () => {}) => {
      axiosRequest(
        {
          url: `${this.url}/${dbName}/`,
          method: "PUT",
          data: {},
        },
        (err, _res, body) => {
          if (err) {
            throw err;
          }
          this
            .tap(() => console.log(`<${dbName}>: ${JSON.stringify(body)}`))
            .tap(cb);
        },
      );
    };
  };

  replicator() {
    return this.tap(this.#createRequest("_replicator"));
  }
  users() {
    return this.tap(this.#createRequest("_users"));
  }
};
