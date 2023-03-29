const { readFileSync, existsSync, mkdirSync } = require('fs');
const { parse, resolve } = require('path');
const AdmZip = require('adm-zip');

const { base } = parse(__dirname);
const { version } = JSON.parse(
  readFileSync(resolve(__dirname, 'build', 'manifest.json'), 'utf8')
);

const outdir = 'release';
const filename = `${base}-v${version}.zip`;
const zip = new AdmZip();
zip.addLocalFolder('build');
if (!existsSync(outdir)) {
  mkdirSync(outdir);
}
zip.writeZip(`${outdir}/${filename}`);

console.log(
  `${chalk.green(
    'Success!'
  )} Created a ${filename} file under ${outdir} directory. You can upload this file to web store.`
);
