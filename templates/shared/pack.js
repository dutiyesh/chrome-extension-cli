const { readFileSync } = require('fs');
const { parse, resolve } = require('path');
const AdmZip = require('adm-zip');

const { base } = parse(__dirname);
const { version } = JSON.parse(
  readFileSync(resolve(__dirname, 'build', 'manifest.json'), 'utf8')
);

const zip = new AdmZip();
zip.addLocalFolder('build');
zip.writeZip(`release/${base}-v${version}.zip`);
