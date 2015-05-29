define([
  'app',
  'api',
  'react',
  'addons/documents/revision-tree/stores',
  'addons/documents/revision-tree/actions',
],

function (app, FauxtonAPI, React, Stores) {

  var store = Stores.revTreeStore;
  // var nodeObjs = [];
  var grid = 100;
  var scale = 7;
  var r = 15;

  var LinesBox = React.createClass({
    render: function () {
      return (
        <g>
          {
            this.props.data.map(function (element, i) {
              return <Line key={i} data={element}/>;
            })
          }
        </g>
      );
    }
  });

  var CirclesBox = React.createClass({

    render: function () {
      return (
        <g>
          {
            this.props.data.map(function (element, i) {
              return <Circle key={i} data={element}/>;
            })
          }
        </g>
      );
    }
  });

  var Circle = React.createClass({

    render: function () {
      var cx = this.props.data.x;
      var cy = this.props.data.y;
      var radius = this.props.data.radius;
      var classVal = this.props.data.class;
      var id = this.props.data.id;

      return (
        <circle cx={cx} cy={cy} r={radius} className={classVal} title={id}>{this.props.children}</circle>
      );
    }
  });

  var Line = React.createClass({

    render: function () {
      var x1 = this.props.data.x;
      var y1 = this.props.data.y;
      var x2 = this.props.data.nextX;
      var y2 = this.props.data.nextY;

      return (
        <line x1={x1} y1={y1} x2={x2} y2={y2}>{this.props.children}</line>
      );
    }
  });

  var TextsBox = React.createClass({

    render: function () {
      return (
        <g>{this.props.children}</g>
      );
    }
  });

  var SVGComponent = React.createClass({

    render: function () {
      return (
        <svg>{this.props.children}
        </svg>
      );
    }
  });

  var Box = React.createClass({

    render: function () {
      return (
        <div className="visualizeRevTree">
          {this.props.children}
        </div>
      );
    }
  });

  var Text = React.createClass({

    render: function () {
      var styleVals = {
        left: this.props.data.stLeft,
        top: this.props.data.stTop
      };

      return (
          <div className="box" style={styleVals} short={this.props.data.short} long={this.props.data.long}>
            <p>{this.props.data.short}</p>
            {this.props.children}
          </div>
      );
    }
  });

  var draw = function (paths, deleted, winner, minUniq) {
    var maxX = grid;
    var maxY = grid;
    var levelCount = []; // numer of nodes on some level (pos)
    var lineObjs = [];
    var nodeObjs = [];
    var textObjs = [];

    var map = {}; // map from rev to position

    function drawPath (path) {

      path.reduce(function (prev, current, index, array) {

        var rev = current;
        var isLeaf = index === 0;
        var pos = +rev.split('-')[0];

        if (!levelCount[pos]) {
          levelCount[pos] = 1;
        }

        var x = levelCount[pos] * grid;
        var y = pos * grid;

        if (!isLeaf) {
          var nextRev = path[index - 1];
          var nextX = map[nextRev][0];
          var nextY = map[nextRev][1];

          if (map[rev]) {
            x = map[rev][0];
            y = map[rev][1];
          }

          var lineObj = {
            "x" : x,
            "y" : y,
            "nextX" : nextX,
            "nextY" : nextY
          };

          lineObjs.push(lineObj);
        }

        if (!map[rev]) {
          maxX = Math.max(x, maxX);
          maxY = Math.max(y, maxY);
          levelCount[pos]++;

          node (x, y, rev, isLeaf, rev in deleted, rev === winner, minUniq, textObjs, nodeObjs);
          map[rev] = [x, y];
        }
      }, 0);
    }

    paths.forEach(drawPath);

    return {
      "lineObjs": lineObjs,
      "textObjs": textObjs,
      "nodeObjs": nodeObjs
    };
  };

  var minUniqueLength = function (arr) {
    function strCommon(a, b) {

      if (a === b) {
        return a.length;
      }

      var i = 0;

      while (++i) {
        if (a[i - 1] !== b[i - 1]) return i;
      }
    }

    var array = arr.slice(0);
    var com = 1;
    array.sort();

    for (var i = 1; i < array.length; i++) {
      com = Math.max(com, strCommon(array[i], array[i - 1]));
    }

    return com;
  };

  function node(x, y, rev, isLeaf, isDeleted, isWinner, shortDescLen, textObjs, nodeObjs) {
    var pos = rev.split('-')[0];
    var id = rev.split('-')[1];
    var opened = false;
    circ(x, y, r, isLeaf, isDeleted, isWinner, nodeObjs, rev);

    var textObj = {
      "stLeft": (x - 40) + "px",
      "stTop": (y - 30) + "px",
      "short": pos + '-' + id.substr(0, shortDescLen),
      "long": pos + '-' + id
    };

    textObjs.push(textObj);
  }

  var circ = function (x, y, r, isLeaf, isDeleted, isWinner, nodeObjs, id) {

    var leafStat = '';

    if (isLeaf) {
      leafStat = 'leaf';
    }
    if (isWinner) {
      leafStat = 'winner';
    }
    if (isDeleted) {
      leafStat = 'deleted';
    }

    var nodeObj = {
      "x" : x,
      "y" : y,
      "class" : leafStat,
      "radius" : r,
      "id" : id
    };

    nodeObjs.push(nodeObj);
  };

  var App = React.createClass({

    getInitialState: function () {
      return {
        treeDataOptions: store.getTreeOptions()
      };
    },

    onChangeSetData: function (lines, treeNodes, nodeTextObjs) {
      this.setState({
        treeDataOptions: store.getTreeOptions()
      });
    },

    componentDidMount: function () {
      store.on('change', this.onChangeSetData, this);
    },

    componentWillUnmount: function () {
      store.off('change', this.onChangeSetData, this);
    },

    render: function () {

      var paths = [];
      var deleted = {};
      var treeDataOptions = this.state.treeDataOptions;
      var result = treeDataOptions.data;
      var winner = treeDataOptions.winner;
      console.log(result);
      console.log(winner);
      var minUniq = 0;

      var allRevs = [];

      paths = result.map(function (res) {

        if (res._deleted) {
          deleted[res._rev] = true;
        }

        var revs = res._revisions;

        revs.ids.forEach( function (id, i) {

          var rev = (revs.start - i) + '-' + id;

          if (allRevs.indexOf(rev) === -1) {
            allRevs.push(rev);
          }

        });

        return revs.ids.map(function (id, i) {
          return (revs.start - i) + '-' + id;
        });
      });

      minUniq = minUniqueLength(allRevs.map(function (rev) {
        return rev.split('-')[1];
      }));

      var treeComponents = draw(paths, deleted, winner, minUniq);

      var lines = treeComponents.lineObjs;
      var nodeTextObjs = treeComponents.textObjs;
      var treeNodes = treeComponents.nodeObjs;

      return (
        <div className = "parent-graph-div">
          <div className="outer-graph-area">
            <div className="inner-graph-area">
              <Box>
                <SVGComponent>
                  <LinesBox data = {lines} />
                  <CirclesBox data = {treeNodes} />
                </SVGComponent>
                {
                  nodeTextObjs.map(function (element, i) {
                    return <Text key={i} data = {element} />;
                  })
                }
              </Box>
            </div>
          </div>
          <div className="legend">
            <svg>
              <circle cx="20" cy="25" r="10" className="leaf"/>
              <text x="40" y="31" fill="black">Leaf Nodes</text>
              <circle cx="220" cy="25" r="10" className="deleted"/>
              <text x="240" y="31" fill="black">Deleted Nodes</text>
              <circle cx="450" cy="25" r="10" className="winner"/>
              <text x="470" y="31" fill="black">Winner Nodes</text>
              <circle cx="620" cy="25" r="10" className=""/>
              <text x="680" y="31" fill="black">Internal Nodes</text>

            </svg>
          </div>
        </div>
      );
    }
  });

  return {
    App: App
  };

});
