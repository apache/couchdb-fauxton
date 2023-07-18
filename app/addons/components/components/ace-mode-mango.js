/* eslint-disable */

// This file is a modified version of "node_modules/ace-builds/src-noconflict/mode-json.js"
// with extra syntax highlighting rules for Mango Query keywords.
// The "ace/mode/mango_highlight_rules" module defines the highlighting rules. It is mostly the same as
// "mode-json.js" except that the 'token: "variable"' rule was changed to tag Mango Query operators
// as 'keyword.operator' instead.

ace.define("ace/mode/mango_highlight_rules", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text_highlight_rules"], function(require, exports, module) {
  "use strict";
  var oop = require("../lib/oop");
  var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;
  var options = ["selector", "limit", "skip", "sort", "fields", "use_index", "fields", "conflicts", "r", "bookmark", "update", "stable", "stale", "execution_stats"];
  var operators = [
    // value operators
    "$gte", "$gt", "$lte", "$lt", "$eq", "$ne", "$type", "$size", "$regex", "$exists", "$mod",
    // list operators
    "$in", "$nin", "$all",
    // selector combination operators
    "$and", "$or", "$nor",
    // selector operators
    "$not",
    // selector condition operators
    "$elemMatch", "$allMatch", "$keyMapMatch"
  ];
  var MangoHighlightRules = function () {
    this.$rules = {
      "start": [
        {
          //token: "variable",
          token: function(value) {
            if (operators.includes(value.substr(1, value.length - 2))) {
              return "keyword.operator";
            } else if (options.includes(value.substr(1, value.length - 2))) {
              return "keyword.operator";
            }
            return "variable";
          },
          regex: '["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]\\s*(?=:)'
        }, {
          token: "string",
          regex: '"',
          next: "string"
        }, {
          token: "constant.numeric",
          regex: "0[xX][0-9a-fA-F]+\\b"
        }, {
          token: "constant.numeric",
          regex: "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
        }, {
          token: "constant.language.boolean",
          regex: "(?:true|false)\\b"
        }, {
          token: "text",
          regex: "['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']"
        }, {
          token: "comment",
          regex: "\\/\\/.*$"
        }, {
          token: "comment.start",
          regex: "\\/\\*",
          next: "comment"
        }, {
          token: "paren.lparen",
          regex: "[[({]"
        }, {
          token: "paren.rparen",
          regex: "[\\])}]"
        }, {
          token: "punctuation.operator",
          regex: /[,]/
        }, {
          token: "text",
          regex: "\\s+"
        }
      ],
      "string": [
        {
          token: "constant.language.escape",
          regex: /\\(?:x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|["\\\/bfnrt])/
        }, {
          token: "string",
          regex: '"|$',
          next: "start"
        }, {
          defaultToken: "string"
        }
      ],
      "comment": [
        {
          token: "comment.end",
          regex: "\\*\\/",
          next: "start"
        }, {
          defaultToken: "comment"
        }
      ]
    };
  };
  oop.inherits(MangoHighlightRules, TextHighlightRules);
  exports.MangoHighlightRules = MangoHighlightRules;

});

ace.define("ace/mode/matching_brace_outdent", ["require", "exports", "module", "ace/range"], function(require, exports, module) {
  "use strict";
  var Range = require("../range").Range;
  var MatchingBraceOutdent = function () { };
  (function () {
    this.checkOutdent = function (line, input) {
      if (!/^\s+$/.test(line))
        return false;
      return /^\s*\}/.test(input);
    };
    this.autoOutdent = function (doc, row) {
      var line = doc.getLine(row);
      var match = line.match(/^(\s*\})/);
      if (!match)
        return 0;
      var column = match[1].length;
      var openBracePos = doc.findMatchingBracket({ row: row, column: column });
      if (!openBracePos || openBracePos.row == row)
        return 0;
      var indent = this.$getIndent(doc.getLine(openBracePos.row));
      doc.replace(new Range(row, 0, row, column - 1), indent);
    };
    this.$getIndent = function (line) {
      return line.match(/^\s*/)[0];
    };
  }).call(MatchingBraceOutdent.prototype);
  exports.MatchingBraceOutdent = MatchingBraceOutdent;

});

ace.define("ace/mode/folding/cstyle", ["require", "exports", "module", "ace/lib/oop", "ace/range", "ace/mode/folding/fold_mode"], function(require, exports, module) {
  "use strict";
  var oop = require("../../lib/oop");
  var Range = require("../../range").Range;
  var BaseFoldMode = require("./fold_mode").FoldMode;
  var FoldMode = exports.FoldMode = function (commentRegex) {
    if (commentRegex) {
      this.foldingStartMarker = new RegExp(this.foldingStartMarker.source.replace(/\|[^|]*?$/, "|" + commentRegex.start));
      this.foldingStopMarker = new RegExp(this.foldingStopMarker.source.replace(/\|[^|]*?$/, "|" + commentRegex.end));
    }
  };
  oop.inherits(FoldMode, BaseFoldMode);
  (function () {
    this.foldingStartMarker = /([\{\[\(])[^\}\]\)]*$|^\s*(\/\*)/;
    this.foldingStopMarker = /^[^\[\{\(]*([\}\]\)])|^[\s\*]*(\*\/)/;
    this.singleLineBlockCommentRe = /^\s*(\/\*).*\*\/\s*$/;
    this.tripleStarBlockCommentRe = /^\s*(\/\*\*\*).*\*\/\s*$/;
    this.startRegionRe = /^\s*(\/\*|\/\/)#?region\b/;
    this._getFoldWidgetBase = this.getFoldWidget;
    this.getFoldWidget = function (session, foldStyle, row) {
      var line = session.getLine(row);
      if (this.singleLineBlockCommentRe.test(line)) {
        if (!this.startRegionRe.test(line) && !this.tripleStarBlockCommentRe.test(line))
          return "";
      }
      var fw = this._getFoldWidgetBase(session, foldStyle, row);
      if (!fw && this.startRegionRe.test(line))
        return "start"; // lineCommentRegionStart
      return fw;
    };
    this.getFoldWidgetRange = function (session, foldStyle, row, forceMultiline) {
      var line = session.getLine(row);
      if (this.startRegionRe.test(line))
        return this.getCommentRegionBlock(session, line, row);
      var match = line.match(this.foldingStartMarker);
      if (match) {
        var i = match.index;
        if (match[1])
          return this.openingBracketBlock(session, match[1], row, i);
        var range = session.getCommentFoldRange(row, i + match[0].length, 1);
        if (range && !range.isMultiLine()) {
          if (forceMultiline) {
            range = this.getSectionRange(session, row);
          } else if (foldStyle != "all")
            range = null;
        }
        return range;
      }
      if (foldStyle === "markbegin")
        return;
      var match = line.match(this.foldingStopMarker);
      if (match) {
        var i = match.index + match[0].length;
        if (match[1])
          return this.closingBracketBlock(session, match[1], row, i);
        return session.getCommentFoldRange(row, i, -1);
      }
    };
    this.getSectionRange = function (session, row) {
      var line = session.getLine(row);
      var startIndent = line.search(/\S/);
      var startRow = row;
      var startColumn = line.length;
      row = row + 1;
      var endRow = row;
      var maxRow = session.getLength();
      while (++row < maxRow) {
        line = session.getLine(row);
        var indent = line.search(/\S/);
        if (indent === -1)
          continue;
        if (startIndent > indent)
          break;
        var subRange = this.getFoldWidgetRange(session, "all", row);
        if (subRange) {
          if (subRange.start.row <= startRow) {
            break;
          } else if (subRange.isMultiLine()) {
            row = subRange.end.row;
          } else if (startIndent == indent) {
            break;
          }
        }
        endRow = row;
      }
      return new Range(startRow, startColumn, endRow, session.getLine(endRow).length);
    };
    this.getCommentRegionBlock = function (session, line, row) {
      var startColumn = line.search(/\s*$/);
      var maxRow = session.getLength();
      var startRow = row;
      var re = /^\s*(?:\/\*|\/\/|--)#?(end)?region\b/;
      var depth = 1;
      while (++row < maxRow) {
        line = session.getLine(row);
        var m = re.exec(line);
        if (!m)
          continue;
        if (m[1])
          depth--;
        else
          depth++;
        if (!depth)
          break;
      }
      var endRow = row;
      if (endRow > startRow) {
        return new Range(startRow, startColumn, endRow, line.length);
      }
    };
  }).call(FoldMode.prototype);

});

ace.define("ace/mode/mango", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text", "ace/mode/mango_highlight_rules", "ace/mode/matching_brace_outdent", "ace/mode/behaviour/cstyle", "ace/mode/folding/cstyle", "ace/worker/worker_client"], function(require, exports, module) {
  "use strict";
  var oop = require("../lib/oop");
  var TextMode = require("./text").Mode;
  var HighlightRules = require("./mango_highlight_rules").MangoHighlightRules;
  var MatchingBraceOutdent = require("./matching_brace_outdent").MatchingBraceOutdent;
  var CstyleBehaviour = require("./behaviour/cstyle").CstyleBehaviour;
  var CStyleFoldMode = require("./folding/cstyle").FoldMode;
  var WorkerClient = require("../worker/worker_client").WorkerClient;
  var Mode = function () {
    this.HighlightRules = HighlightRules;
    this.$outdent = new MatchingBraceOutdent();
    this.$behaviour = new CstyleBehaviour();
    this.foldingRules = new CStyleFoldMode();
  };
  oop.inherits(Mode, TextMode);
  (function () {
    this.lineCommentStart = "//";
    this.blockComment = { start: "/*", end: "*/" };
    this.getNextLineIndent = function (state, line, tab) {
      var indent = this.$getIndent(line);
      if (state == "start") {
        var match = line.match(/^.*[\{\(\[]\s*$/);
        if (match) {
          indent += tab;
        }
      }
      return indent;
    };
    this.checkOutdent = function (state, line, input) {
      return this.$outdent.checkOutdent(line, input);
    };
    this.autoOutdent = function (state, doc, row) {
      this.$outdent.autoOutdent(doc, row);
    };
    this.createWorker = function (session) {
      var worker = new WorkerClient(["ace"], "ace/mode/mango_worker", "MangoWorker");
      worker.attachToDocument(session.getDocument());
      worker.on("annotate", function (e) {
        session.setAnnotations(e.data);
      });
      worker.on("terminate", function () {
        session.clearAnnotations();
      });
      return worker;
    };
    this.$id = "ace/mode/mango";
  }).call(Mode.prototype);
  exports.Mode = Mode;

});                (function() {
  ace.require(["ace/mode/mango"], function(m) {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m;
    }
  });
})();
