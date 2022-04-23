const path = require('path');
const require3 = require('require3');
const babel = require3('@babel/core');
const UglifyJS = require3('uglify-js');
const fse = require3('fs-extra');

module.exports = ctx => {
  class Cli extends ctx.app.meta.CliBase(ctx) {
    async execute({ command, context, user }) {
      const { cwd, argv } = context;
      // super
      await super.execute({ command, context, user });
      const files = argv._;
      const total = files.length;
      for (let index = 0; index < total; index++) {
        const file = files[index];
        // log
        await this.log({
          progressNo: 0,
          total,
          progress: index,
          text: file,
        });
        // transform
        const fileSrc = path.join(cwd, file);
        const pos = fileSrc.lastIndexOf('.js');
        if (pos === -1) continue;
        const fileDest = fileSrc.substr(0, pos) + '.min.js';
        this._transform(fileSrc, fileDest);
      }
    }

    _transform(fileSrc, fileDest) {
      let content = fse.readFileSync(fileSrc);
      // transform
      content = babel.transform(content, {
        ast: false,
        babelrc: false,
        presets: ['@babel/preset-env'],
        plugins: [],
      }).code;
      // uglify
      const output = UglifyJS.minify(content);
      if (output.error) throw new Error(`${output.error.name}: ${output.error.message}`);
      content = output.code;
      // output
      fse.outputFileSync(fileDest, content);
    }
  }

  return Cli;
};
