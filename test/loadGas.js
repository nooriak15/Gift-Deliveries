'use strict';

// Apps Script files share one global scope at runtime (there's no module
// system). To unit test them from Node without a bundler, this loads the
// requested .gs files' source into a single vm sandbox context, the same
// way Apps Script would, and hands back that context so tests can call the
// functions it defines directly.

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadGasModules(filenames) {
  const sandbox = {
    PropertiesService: undefined,
    UrlFetchApp: undefined,
    Utilities: undefined,
    Logger: { log: () => {} }
  };
  vm.createContext(sandbox);
  for (const filename of filenames) {
    const code = fs.readFileSync(path.join(__dirname, '..', 'src', filename), 'utf8');
    vm.runInContext(code, sandbox, { filename });
  }
  return sandbox;
}

module.exports = { loadGasModules };
