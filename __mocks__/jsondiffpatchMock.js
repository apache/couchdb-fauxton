// mock calls to diff() from jsondiffpatch
module.exports = {
  diff: function() {
    return {
      "mock": "a mock object"
    };
  },
};
