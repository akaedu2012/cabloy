const path = require('path');
const fse = require('fs-extra');
const Command = require('egg-bin').Command;

class EggBornBinCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: egg-born-bin [command] [options]';

    // load directory
    this.load(path.join(__dirname, 'lib/cmd'));
  }
}

module.exports = EggBornBinCommand;

function parseFirstLineDate(file) {
  // read
  const content = fse.readFileSync(file).toString();
  const lineFirst = content.split('\n')[0];
  const match = lineFirst.match(/\d{4}-\d{2}-\d{2}/);
  if (!match || !match[0]) return null;
  return new Date(match[0]);
}

function checkEslintrc() {
  const eslintrcPath = path.join(process.cwd(), '.eslintrc.js');
  if (!fse.existsSync(eslintrcPath)) return true;
  // date
  const date = parseFirstLineDate(eslintrcPath);
  if (!date) return true;
  // date src
  const eslintrcPathSrc = path.join(__dirname, './format/.eslintrc.js');
  const dateSrc = parseFirstLineDate(eslintrcPathSrc);
  return date < dateSrc;
}

function confirmFormat() {
  // check if in project path (not lerna/module)
  if (!fse.existsSync(path.join(process.cwd(), 'src/module'))) return;
  if (fse.existsSync(path.join(process.cwd(), 'packages/cabloy'))) return;
  // check .eslintrc.js
  if (!checkEslintrc()) return;
  // copy
  const files = ['.eslintrc.js', '.eslintignore', '.prettierrc', '.prettierignore'];
  for (const file of files) {
    const fileDest = path.join(process.cwd(), file);
    const fileSrc = path.join(__dirname, `./format/${file}`);
    fse.copySync(fileSrc, fileDest);
  }
  console.log('eslint updated!!!\n');
}

confirmFormat();
