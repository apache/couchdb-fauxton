// mock calls to format() from jsondiffpatch/formatters/html
module.exports = {
  format: function() {
    return "<div>mock json diff</div>";
  },
};
