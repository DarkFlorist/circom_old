#!/usr/bin/env node

/*
    Copyright 2018 0KIMS association.

    This file is part of circom (Zero Knowledge Circuit Compiler).

    circom is a free software: you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    circom is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
    License for more details.

    You should have received a copy of the GNU General Public License
    along with circom. If not, see <https://www.gnu.org/licenses/>.
*/

/* eslint-disable no-console */

const fs = require("node:fs");
const path = require("node:path");

const compiler = require("./src/compiler");

function parseArgs(usageInfo, ...def){
    function processDef(...def){
      const res = {};
      for (const d of def) {
        if (d.full) {
            res['-'+d.full] = d;
            res['--'+d.full] = d;
        }
        if (d.short) {
            res['-'+d.short] = d;
            res['--'+d.short] = d;
        }
      }
      return res;
    }
    function usage(){
      console.log(usageInfo)
      process.exit(1);
    }
    def = processDef(...def);
    const args = process.argv.slice(2);
    const rest = [];
    const data = {};
    for (let i=0; i<args.length; i++) {
      const a = args[i];
      if (a==='-h' || a==='--help') usage();
      const d = def[a];
      if (d) {
        if (d.type==='boolean')  data[d.full] = true
        else data[d.full] = args[++i];
        continue;
      } else {
        if (a.startsWith('-')) throw new Error('Unknown flag: '+a);
        rest.push(a);
      }
    }
    return {...data, _: rest};
  }

const argv = parseArgs(`circom [input source circuit file] -o [output definition circuit file]

Options:
  --version      Show version number                                   [boolean]
  -h, --help     Show help                                             [boolean]
  --verbose, -v  Run with verbose logging                              [boolean]
  --fast, -f     Do not optimize constraints                           [boolean]

Copyright (C) 2018  0kims association
    This program comes with ABSOLUTELY NO WARRANTY;
    This is free software, and you are welcome to redistribute it
    under certain conditions; see the COPYING file in the official
    repo directory at  https://github.com/iden3/circom`, 
    { full: 'output', short: 'o' }, 
    { full: 'verbose', short: 'v', type: 'boolean' }, 
    { full: 'fast', short: 'f', type: 'boolean' }
);

let inputFile;
if (argv._.length == 0) {
    inputFile = "circuit.circom";
} else if (argv._.length == 1) {
    inputFile = argv._[0];
} else  {
    console.log("Only one circuit at a time is permited");
    process.exit(1);
}

const fullFileName = path.resolve(process.cwd(), inputFile);
const outName = argv.output ?  argv.output : "circuit.json";

compiler(fullFileName, {reduceConstraints: !argv.fast, verbose: argv.verbose}).then( (cir) => {
    fs.writeFileSync(outName, JSON.stringify(cir, null, 1), "utf8");
    process.exit(0);
}, (err) => {
//    console.log(err);
    console.log(err.stack);
    if (err.pos) {
        console.error(`ERROR at ${err.errFile}:${err.pos.first_line},${err.pos.first_column}-${err.pos.last_line},${err.pos.last_column}   ${err.errStr}`);
    } else {
        console.log(err.message);
        if (argv.verbose) console.log(err.stack);
    }
    if (err.ast) {
        console.error(JSON.stringify(err.ast, null, 1));
    }
    process.exit(1);
});




