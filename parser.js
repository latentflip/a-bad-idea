var fs = require('fs');
var PEG = require('pegjs');

var parser = PEG.buildParser(fs.readFileSync('./grammar.pegjs').toString());

function parse(file) {
    try {
        return parser.parse(file);
    } catch (e) {
        console.log(e);
        console.log(e.message);
    }
}

module.exports.parse = parse;

//console.log(JSON.stringify(parse(fs.readFileSync('./ExampleMakefile').toString()), null, 2));
