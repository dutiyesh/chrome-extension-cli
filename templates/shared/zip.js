const { readFileSync } = require('fs');
const { parse, resolve } = require('path');
const AdmZip = require('adm-zip');

const { name } = parse(__dirname);
const { version } = JSON.parse(
  readFileSync(resolve(__dirname, 'public', 'manifest.json'), 'utf8')
);

const zip = new AdmZip();
zip.addLocalFolder('build');
zip.writeZip(`${name}-v${version}.zip`);
