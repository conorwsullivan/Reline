(function() {
  var Lexer, _ref, compile, fs, lexer, parser, path;
  path = require('path');
  _ref = require('./lexer');
  Lexer = _ref.Lexer;
  _ref = require('./parser');
  parser = _ref.parser;
  var preline=function(code){
	//console.log(code);
	lineList=code.split("\n");
	sys=require("sys");
	for(var i in lineList)
	{
		//console.log(typeof(lineList[i]),lineList[i].prototype);
		var line=lineList[i];
		line=line.replace("\n","").replace("\r","");
		//console.log(line.substr(0,line.search(/[^\s]/)),"*");
		lineList[i]=[line.substr(0,line.search(/[^\s]/)),"###:::line ",i.toString(),":::###\n",line].join("");
	}
	//console.log(lineList.join("\n"));
	return lineList.join("\n");
  };
  var reline=function(code){
	lineList=code.split("\n");
	var outputLine=0;
	for(var i in lineList)
	{
		var line=lineList[i];
		line=line.replace("\n","").replace("\r","");
		console.log(line);
		while(true)
		{
			var match=line.match(/\/\*:::line (\d+):::\*\//);
			//console.log(match);
			if(match)
			{
				var inputLine=parseInt(match[1]);
				var insertion="";
				console.log(inputLine,outputLine);
				while(inputLine>outputLine)
				{
					insertion+="\n";
					outputLine++;
				}
				line=line.replace(/\/\*:::line (\d+):::\*\//,insertion);
				console.log(line);
			}
			else
				break;
		}
		
		lineList[i]=line;
	}
	console.log(lineList.join(""));
	return lineList.join("");
  };
  if (require.extensions) {
    fs = require('fs');
    require.extensions['.coffee'] = function(module, filename) {
      var content;
      content = compile(fs.readFileSync(filename, 'utf8'));
      module.filename = ("" + (filename) + " (compiled)");
      return module._compile(content, module.filename);
    };
  } else if (require.registerExtension) {
    require.registerExtension('.coffee', function(content) {
      return compile(content);
    });
  }
  exports.VERSION = '0.9.4';
  exports.compile = (compile = function(code, options) {
    options || (options = {});
    try {
      return reline((parser.parse(lexer.tokenize(preline(code)))).compile(options));
    } catch (err) {
      if (options.fileName) {
        err.message = ("In " + (options.fileName) + ", " + (err.message));
      }
      throw err;
    }
  });
  exports.tokens = function(code) {
    return lexer.tokenize(code);
  };
  exports.nodes = function(code) {
    return parser.parse(lexer.tokenize(code));
  };
  exports.run = function(code, options) {
    var __filename, root;
    root = module;
    while (root.parent) {
      root = root.parent;
    }
    root.filename = (__filename = ("" + (options.fileName) + " (compiled)"));
    if (root.moduleCache) {
      root.moduleCache = {};
    }
    return root._compile(exports.compile(code, options), root.filename);
  };
  exports.eval = function(code, options) {
    var __dirname, __filename;
    __filename = options.fileName;
    __dirname = path.dirname(__filename);
    return eval(exports.compile(code, options));
  };
  lexer = new Lexer();
  parser.lexer = {
    lex: function() {
      var token;
      token = this.tokens[this.pos] || [""];
      this.pos += 1;
      this.yylineno = token[2];
      this.yytext = token[1];
      return token[0];
    },
    setInput: function(tokens) {
      this.tokens = tokens;
      return (this.pos = 0);
    },
    upcomingInput: function() {
      return "";
    }
  };
  parser.yy = require('./nodes');
}).call(this);
