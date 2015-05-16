define([
  "app",
  "api",
  "react",
  'addons/documents/revisionTree/stores',
  'addons/documents/revisionTree/actions',
],

function (app, FauxtonAPI, React, Stores) {

  var store = Stores.revTreeStore;
  var lineObjs = [];
  var nodeObjs = [];
  var textObjs = [];
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
            this.props.data.map (function (element, i) {
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
      var radius = r;
      var classVal = this.props.data.class;

      return (
        <circle cx={cx} cy={cy} r={radius} className={classVal}>{this.props.children}</circle>
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
        <svg height="500" width="500">{this.props.children}
        </svg>
      );
    }
  });

  var Box = React.createClass({

    render: function () {
      return (
        <div className = "visualizeRevTree">
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
          <div className = "box" style={styleVals} short={this.props.data.short} long={this.props.data.long}>
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
    lineObjs.length = 0;
    nodeObjs.length = 0;
    textObjs.length = 0;

    var map = {}; // map from rev to position

    function drawPath(path) {
      for (var i = 0; i < path.length; i++) {
        var rev = path[i];
        var isLeaf = i === 0;
        var pos = +rev.split('-')[0];

        if (!levelCount[pos]) {
          levelCount[pos] = 1;
        }

        var x = levelCount[pos] * grid;
        var y = pos * grid;

        if (!isLeaf) {
          var nextRev = path[i - 1];
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

        if (map[rev]) {
          break;
        }

        maxX = Math.max(x, maxX);
        maxY = Math.max(y, maxY);
        levelCount[pos]++;

        node(x, y, rev, isLeaf, rev in deleted, rev === winner, minUniq);
        map[rev] = [x, y];
      }
    }

    paths.forEach(drawPath);
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

  function node(x, y, rev, isLeaf, isDeleted, isWinner, shortDescLen) {
    circ(x, y, r, isLeaf, isDeleted, isWinner);
    var pos = rev.split('-')[0];
    var id = rev.split('-')[1];
    var opened = false;

    var textObj = {
      "stLeft": (x - 40) + "px",
      "stTop": (y - 30) + "px",
      "short": pos + '-' + id.substr(0, shortDescLen),
      "long": pos + '-' + id
    };

    textObjs.push(textObj);
  }

  var circ = function (x, y, r, isLeaf, isDeleted, isWinner) {

    var leafStat = "";

    if (isLeaf) {
      leafStat = "leaf";
    }
    if (isWinner) {
      leafStat = "winner";
    }
    if (isDeleted) {
      leafStat = "deleted";
    }

    var nodeObj = {
      "x" : x,
      "y" : y,
      "class" : leafStat
    };

    nodeObjs.push(nodeObj);
  };

  var App = React.createClass({

    getInitialState: function () {
      return {
        lines: [],
        treeNodes: [],
        nodeTextObjs: []
      };
    },

    componentDidMount: function () {
      var paths = [];
      var deleted = {};
      var treeDataOptions = store.getTreeOptions();
      var result = treeDataOptions.data;
      var winner = treeDataOptions.winner;
      console.log(result);
      console.log(winner);
      var minUniq = 0;

      if (this.isMounted()) {

        var allRevs = [];

        paths = result.map(function (res) {

        // TODO: what about missing
          if (res._deleted) {
            deleted[res._rev] = true;
          }

          var revs = res._revisions;

          revs.ids.forEach( function (id, i) {

            var rev = (revs.start - i) + '-' + id;

            if (allRevs.indexOf(rev) === -1) {
              allRevs.push(rev);
            }

            i--;
          });

          return revs.ids.map(function (id, i) {
            return (revs.start - i) + '-' + id;
          });
        });

        minUniq = minUniqueLength(allRevs.map( function (rev) {
          return rev.split('-')[1];
        }));

        draw(paths, deleted, winner, minUniq);

        this.setState({
          lines: lineObjs,
          treeNodes: nodeObjs,
          nodeTextObjs: textObjs
        });
      }
    },

    render: function () {
      return (
        <div>
          <Box>
            <SVGComponent>
              <LinesBox data = {this.state.lines} />
              <CirclesBox data = {this.state.treeNodes} />
            </SVGComponent>
            {
              this.state.nodeTextObjs.map(function (element, i) {
                return <Text key={i} data = {element} />;
              })
            }
          </Box>
        </div>
      );
    }
  });

  return {
    App: App
  };

});
