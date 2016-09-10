var webpack = require("webpack");
const config = require('../webpack.config.release');
const helper = require('webpack-dependency-tree');
// returns a Compiler instance
webpack(config, function(err, stats) {
  const tree = helper.fromStats(stats);
  console.log(helper.treeToString(tree));
});
