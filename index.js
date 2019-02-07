const program = require('commander');
const convert = require('./src/convert');

program.parse(process.argv);

const filePath = program.args[0];

convert(filePath);
