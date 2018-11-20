const acorn = require('acorn');
const colors = require('colors/safe');
const tempy = require('tempy');
const fs = require('fs-extra');
const { spawn } = require('child_process');
const path = require('path');

const acornBin = path.resolve(__dirname, '../node_modules/acorn/bin/acorn');

const PLUGIN_NAME = 'CheckES5WebpackPlugin';

const tapCompilerEmitHook = (compiler, fn) => {
  if (compiler.hooks) {
    compiler.hooks.emit.tapPromise(PLUGIN_NAME, async compilation => fn(compilation));
  } else {
    compiler.plugin('emit', async (compilation, callback) => {
      try {
        await fn(compilation)
        callback(null)
      } catch (e) {
        callback(e)
      }
    });
  }
}

const log = (msg) => {
  console.log(`[${PLUGIN_NAME}]${msg}`);
}

const check = async (source) => {
  const code = source.source();
  try {
    acorn.parse(code, {
      ecmaVersion: 5
    });
    return true;
  } catch (e) {
    return false;
  }
}

const checkSpawn = async (source) => {
  const code = source.source();
  const fileName = tempy.file({extension: 'js'});
  await fs.outputFile(fileName, code);
  const isValid = await new Promise((resolve, reject) => {
    const ls = spawn(`${acornBin}`, [ fileName, '--ecma5', '--silent' ]);
    ls.stderr.on('data', () => {
      reject(Error());
    });
    ls.on('close', (code) => {
      resolve(!code);
    });
  });
  await fs.remove(fileName);
  return isValid;
}

module.exports = class CheckES5WebpackPlugin {
  constructor (opts) {
    opts = opts || {}
    const spawn = ('spawn' in opts) ? !!opts.spawn : true;
    this.opts = { spawn };
  }

  apply(compiler) {
    tapCompilerEmitHook(compiler, async compilation => {
      const assets = compilation.assets;
      const assetsFiles = Object.keys(assets).filter(fileName => fileName.endsWith('.js'));

      const checkFn = this.opts.spawn ? checkSpawn :  check;

      const promises = assetsFiles.map(async fileName => {
        return [fileName, await checkFn(assets[fileName])];
      });
      const arr = await Promise.all(promises)
      const errorJsFiles = arr.filter(([fileName, isValid]) => !isValid).map(([fileName]) => fileName)

      if (!errorJsFiles.length) {
        log(colors.green(`All js files are ES5 compatible.`));
        return;
      }

      for (let fileName of errorJsFiles) {
        log(colors.red(` \`${fileName}\` is not ES5 compatible.`));
      }
      throw Error('Some js files are not ES5 compatible.');
    })
  }
};
